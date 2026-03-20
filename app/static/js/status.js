/**
 * Universe Reborn — Statut serveur en temps réel
 * Appelle l'API /api/status toutes les 30 secondes
 */
(function() {
    var badge        = document.getElementById('server-status-badge');
    var statusText   = document.getElementById('status-text');
    var statusDot    = document.getElementById('status-dot');
    var playersOnline = document.getElementById('players-online');

    if (!badge || !statusText) return;

    function setAllZeroOnline() {
        if (playersOnline) playersOnline.textContent = '0';
        document.querySelectorAll('[data-zone]').forEach(function(el) {
            el.textContent = '0';
        });
    }

    function updateStatus() {
        fetch('/api/status')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.online) {
                    badge.classList.remove('offline');
                    var count = typeof data.players_online === 'number' ? data.players_online : 0;
                    statusText.textContent = 'SERVEUR EN LIGNE' + (count > 0 ? ' — ' + count + ' JOUEUR' + (count > 1 ? 'S' : '') : '');
                    if (statusDot) statusDot.style.background = 'var(--color-success)';
                    if (playersOnline) playersOnline.textContent = count;
                } else {
                    badge.classList.add('offline');
                    statusText.textContent = 'SERVEUR HORS LIGNE';
                    if (statusDot) statusDot.style.background = 'var(--color-danger)';
                    // Serveur éteint : tous les compteurs à 0
                    setAllZeroOnline();
                }
            })
            .catch(function() {
                statusText.textContent = 'STATUT INCONNU';
                setAllZeroOnline();
            });
    }

    updateStatus();
    setInterval(updateStatus, 30000);
})();
