/**
 * Universe Reborn — Statut serveur en temps réel
 * Appelle /api/status toutes les 30s
 * Règle absolue : si offline -> TOUS les compteurs = 0
 */
(function () {
    var badge         = document.getElementById('server-status-badge');
    var statusText    = document.getElementById('status-text');
    var statusDot     = document.getElementById('status-dot');
    var playersOnline = document.getElementById('players-online');

    if (!badge || !statusText) return;

    function resetAllToZero() {
        if (playersOnline) playersOnline.textContent = '0';
        // Réinitialiser les compteurs par monde
        document.querySelectorAll('[data-zone]').forEach(function (el) {
            el.textContent = '0';
        });
        // Réinitialiser aussi les data-target animés si serveur offline
        // (on force le texte visible à 0, pas le data-target)
    }

    function updateStatus() {
        fetch('/api/status')
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (data.online) {
                    badge.classList.remove('offline');
                    badge.classList.add('online');
                    var count = (typeof data.players_online === 'number') ? data.players_online : 0;
                    var label = count > 0
                        ? 'EN LIGNE — ' + count + ' JOUEUR' + (count > 1 ? 'S' : '')
                        : 'SERVEUR EN LIGNE';
                    statusText.textContent = label;
                    if (statusDot) {
                        statusDot.style.background = 'var(--color-success)';
                        statusDot.style.animation = 'pulse 2s infinite';
                    }
                    if (playersOnline) playersOnline.textContent = count;
                } else {
                    badge.classList.remove('online');
                    badge.classList.add('offline');
                    statusText.textContent = 'SERVEUR HORS LIGNE';
                    if (statusDot) {
                        statusDot.style.background = 'var(--color-danger)';
                        statusDot.style.animation = 'none';
                    }
                    // Règle critique : serveur offline = TOUS les compteurs à 0
                    resetAllToZero();
                }
            })
            .catch(function () {
                badge.classList.add('offline');
                statusText.textContent = 'STATUT INCONNU';
                resetAllToZero();
            });
    }

    // Lancement immédiat + interval 30s
    updateStatus();
    setInterval(updateStatus, 30000);
})();
