/**
 * Universe Reborn — Statut serveur en temps réel
 * Appelle l'API /api/status toutes les 30 secondes
 */
(function() {
    const badge = document.getElementById('server-status-badge');
    const statusText = document.getElementById('status-text');
    const statusDot = document.getElementById('status-dot');
    const playersOnline = document.getElementById('players-online');

    if (!badge || !statusText) return;

    function updateStatus() {
        fetch('/api/status')
            .then(res => res.json())
            .then(data => {
                if (data.online) {
                    badge.classList.remove('offline');
                    statusText.textContent = `SERVEUR EN LIGNE${data.players_online > 0 ? ' — ' + data.players_online + ' JOUEURS' : ''}`;
                    if (statusDot) statusDot.style.background = 'var(--color-success)';
                } else {
                    badge.classList.add('offline');
                    statusText.textContent = 'SERVEUR HORS LIGNE';
                    if (statusDot) statusDot.style.background = 'var(--color-danger)';
                }
                if (playersOnline && data.players_online !== undefined) {
                    playersOnline.textContent = data.players_online;
                }
            })
            .catch(() => {
                statusText.textContent = 'STATUT INCONNU';
            });
    }

    updateStatus();
    setInterval(updateStatus, 30000);
})();
