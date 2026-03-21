# =============================================================
#  Universe Reborn — Characters Blueprint
#  Parsing XML complet, inventaire, rescue, gestion permissions
#  Parite NexusDashboard
# =============================================================
import xml.etree.ElementTree as ET
from xml.dom import minidom
from flask import Blueprint, render_template, abort, redirect, url_for, flash, request, make_response
from flask_login import login_required, current_user
from app import db
from app.models import ZONE_NAMES, INVENTORY_NAMES, AuditLog

try:
    import xmltodict
    HAS_XMLTODICT = True
except ImportError:
    HAS_XMLTODICT = False

characters_bp = Blueprint('characters', __name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _conn():
    return db.engine.connect()


def _get_char(char_id, conn):
    return conn.execute(
        db.text("SELECT id, name, account_id, last_zone, last_login, permission_map, pending_name, needs_rename "
                "FROM charinfo WHERE id = :id"),
        {'id': char_id}
    ).fetchone()


def _get_xml(char_id, conn):
    row = conn.execute(
        db.text("SELECT xml_data FROM charxml WHERE id = :id"),
        {'id': char_id}
    ).fetchone()
    return row[0] if row else None


def _log_audit(action):
    try:
        db.session.add(AuditLog(
            account_id=current_user.id,
            username=current_user.username,
            action=action
        ))
        db.session.commit()
    except Exception:
        db.session.rollback()


def _parse_char_xml(raw_xml):
    """Parse le XML DarkflameServer, retourne un dict."""
    if not HAS_XMLTODICT or not raw_xml:
        return None
    try:
        fixed = raw_xml.replace('"stt=', '" stt=')
        data = xmltodict.parse(fixed, attr_prefix='attr_')
        # Renommer 'items' en 'holdings' pour eviter conflit Jinja
        inv = data.get('obj', {}).get('inv', {})
        if 'items' in inv:
            inv['holdings'] = inv.pop('items')
        # Trier les items par slot
        holdings = inv.get('holdings', {})
        bags = holdings.get('in', [])
        if isinstance(bags, dict):
            bags = [bags]
        for bag in bags:
            if 'i' in bag and isinstance(bag['i'], list):
                try:
                    bag['i'] = sorted(bag['i'], key=lambda x: int(x.get('attr_s', 0)))
                except Exception:
                    pass
        return data
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Vue detail d'un personnage
# ---------------------------------------------------------------------------
@characters_bp.route('/<int:char_id>')
@login_required
def detail(char_id):
    with _conn() as conn:
        char = _get_char(char_id, conn)
        if not char:
            abort(404)
        # Securite : propre compte ou GM >= 3
        if current_user.gm_level < 3 and char[2] != current_user.id:
            abort(403)
        raw_xml = _get_xml(char_id, conn)

    char_json = _parse_char_xml(raw_xml)
    zone_name = ZONE_NAMES.get(char[3], f'Zone {char[3]}')

    # Permission map
    perm_map = char[5] or 0
    perms = {
        'trade': bool(perm_map & (1 << 4)),
        'mail': bool(perm_map & (1 << 5)),
        'chat': bool(perm_map & (1 << 6)),
    }

    return render_template(
        'panel/character_detail.html',
        char={
            'id': char[0], 'name': char[1], 'account_id': char[2],
            'zone': zone_name, 'last_login': char[4],
            'perm_map': perm_map, 'perms': perms,
            'pending_name': char[6], 'needs_rename': char[7],
        },
        char_json=char_json,
        inventory_names=INVENTORY_NAMES,
        has_xmltodict=HAS_XMLTODICT
    )


# ---------------------------------------------------------------------------
# Vue XML brut (pour debug admin)
# ---------------------------------------------------------------------------
@characters_bp.route('/<int:char_id>/xml')
@login_required
def view_xml(char_id):
    if current_user.gm_level < 3:
        abort(403)
    with _conn() as conn:
        char = _get_char(char_id, conn)
        if not char:
            abort(404)
        raw_xml = _get_xml(char_id, conn)
    if not raw_xml:
        abort(404)
    response = make_response(raw_xml)
    response.headers.set('Content-Type', 'text/xml')
    return response


# ---------------------------------------------------------------------------
# Telechargement XML (RGPD + admin)
# ---------------------------------------------------------------------------
@characters_bp.route('/<int:char_id>/download_xml')
@login_required
def download_xml(char_id):
    with _conn() as conn:
        char = _get_char(char_id, conn)
        if not char:
            abort(404)
        if current_user.gm_level < 3 and char[2] != current_user.id:
            abort(403)
        raw_xml = _get_xml(char_id, conn)
    if not raw_xml:
        abort(404)
    response = make_response(raw_xml)
    response.headers.set('Content-Type', 'application/xml')
    response.headers.set(
        'Content-Disposition', 'attachment',
        filename=f"{char[1]}.xml"
    )
    return response


# ---------------------------------------------------------------------------
# Rescue : teleporter le personnage vers une zone sauvegardee
# ---------------------------------------------------------------------------
@characters_bp.route('/<int:char_id>/rescue', methods=['GET', 'POST'])
@login_required
def rescue(char_id):
    if current_user.gm_level < 3:
        abort(403)
    with _conn() as conn:
        char = _get_char(char_id, conn)
        if not char:
            abort(404)
        raw_xml = _get_xml(char_id, conn)

    if not raw_xml:
        flash('Aucune donnee XML pour ce personnage.', 'danger')
        return redirect(url_for('characters.detail', char_id=char_id))

    xml_fixed = raw_xml.replace('"stt=', '" stt=')
    char_xml = ET.XML(xml_fixed)

    # Lister les zones visitees
    zones = []
    for zone in char_xml.findall('.//r'):
        w = int(zone.attrib.get('w', 0))
        if w % 100 == 0 and w > 0:
            zones.append((str(w), ZONE_NAMES.get(w, f'Zone {w}')))

    error = None
    if request.method == 'POST':
        target_world = request.form.get('world_id', '')
        new_zone = char_xml.find(f'.//r[@w="{target_world}"]')
        if new_zone is None:
            error = 'Zone introuvable dans les donnees du personnage.'
        else:
            char_elem = char_xml.find(".//char")
            if char_elem is not None:
                char_elem.attrib['lzx'] = new_zone.attrib.get('x', '0')
                char_elem.attrib['lzy'] = new_zone.attrib.get('y', '0')
                char_elem.attrib['lzz'] = new_zone.attrib.get('z', '0')
                char_elem.attrib['lwid'] = target_world
            new_xml = ET.tostring(char_xml, encoding='unicode')
            with _conn() as conn:
                conn.execute(
                    db.text("UPDATE charxml SET xml_data = :x WHERE id = :id"),
                    {'x': new_xml, 'id': char_id}
                )
                conn.commit()
            _log_audit(f"Rescue ({char_id}){char[1]} vers zone {target_world}")
            flash(f'Personnage teleporte vers {ZONE_NAMES.get(int(target_world), target_world)}.', 'success')
            return redirect(url_for('characters.detail', char_id=char_id))

    return render_template(
        'panel/character_rescue.html',
        char={'id': char[0], 'name': char[1]},
        zones=zones,
        error=error
    )


# ---------------------------------------------------------------------------
# Toggle permission (trade/mail/chat) — GM >= 3
# ---------------------------------------------------------------------------
@characters_bp.route('/<int:char_id>/permission/<int:bit>', methods=['POST'])
@login_required
def toggle_permission(char_id, bit):
    if current_user.gm_level < 3:
        abort(403)
    if bit not in (4, 5, 6):
        abort(400)
    with _conn() as conn:
        char = _get_char(char_id, conn)
        if not char:
            abort(404)
        perm_map = (char[5] or 0) ^ (1 << bit)
        conn.execute(
            db.text("UPDATE charinfo SET permission_map = :p WHERE id = :id"),
            {'p': perm_map, 'id': char_id}
        )
        conn.commit()
    labels = {4: 'Trade', 5: 'Mail', 6: 'Chat'}
    _log_audit(f"Toggle permission {labels[bit]} sur ({char_id}){char[1]} -> {perm_map}")
    flash(f'Permission {labels[bit]} mise a jour.', 'success')
    return redirect(url_for('characters.detail', char_id=char_id))


# ---------------------------------------------------------------------------
# Approbation de nom de personnage — GM >= 3
# ---------------------------------------------------------------------------
@characters_bp.route('/<int:char_id>/approve_name/<action>', methods=['POST'])
@login_required
def approve_name(char_id, action):
    if current_user.gm_level < 3:
        abort(403)
    with _conn() as conn:
        char = _get_char(char_id, conn)
        if not char:
            abort(404)
        if action == 'approve' and char[6]:  # pending_name
            conn.execute(
                db.text("UPDATE charinfo SET name = pending_name, pending_name = '' WHERE id = :id"),
                {'id': char_id}
            )
            conn.commit()
            _log_audit(f"Approuve le nom '{char[6]}' pour ({char_id}){char[1]}")
            flash(f"Nom '{char[6]}' approuve.", 'success')
        elif action == 'rename':
            conn.execute(
                db.text("UPDATE charinfo SET needs_rename = 1 WHERE id = :id"),
                {'id': char_id}
            )
            conn.commit()
            _log_audit(f"Marque ({char_id}){char[1]} comme devant etre renomme")
            flash(f'Personnage marque pour renommage.', 'warning')
        else:
            flash('Action invalide.', 'danger')
    return redirect(url_for('characters.detail', char_id=char_id))


# ---------------------------------------------------------------------------
# Upload XML (GM >= 8 seulement)
# ---------------------------------------------------------------------------
@characters_bp.route('/<int:char_id>/upload_xml', methods=['GET', 'POST'])
@login_required
def upload_xml(char_id):
    if current_user.gm_level < 8:
        abort(403)
    with _conn() as conn:
        char = _get_char(char_id, conn)
        if not char:
            abort(404)
        raw_xml = _get_xml(char_id, conn)

    error = None
    if request.method == 'POST':
        new_xml = request.form.get('char_xml', '').strip()
        if not new_xml:
            error = 'XML vide.'
        else:
            try:
                ET.XML(new_xml)  # validation
            except ET.ParseError as e:
                error = f'XML invalide : {e}'
        if not error:
            with _conn() as conn:
                conn.execute(
                    db.text("UPDATE charxml SET xml_data = :x WHERE id = :id"),
                    {'x': new_xml, 'id': char_id}
                )
                conn.commit()
            _log_audit(f"Upload XML pour ({char_id}){char[1]}")
            flash('XML mis a jour. Tu acceptes toutes les consequences.', 'warning')
            return redirect(url_for('characters.detail', char_id=char_id))

    # Format XML pour l'affichage
    pretty_xml = raw_xml or ''
    try:
        pretty_xml = minidom.parseString(raw_xml).toprettyxml(indent='   ')
    except Exception:
        pass

    return render_template(
        'panel/character_upload_xml.html',
        char={'id': char[0], 'name': char[1]},
        pretty_xml=pretty_xml,
        error=error
    )
