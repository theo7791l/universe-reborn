/**
 * Universe Reborn — Effet particules Maelstrom
 * Particules violettes/bleues flottantes en arrière-plan
 */
(function() {
    const container = document.getElementById('particles-container');
    if (!container) return;

    const PARTICLE_COUNT = 60;
    const particles = [];

    const colors = [
        'rgba(102, 0, 204, 0.6)',
        'rgba(0, 102, 204, 0.5)',
        'rgba(136, 51, 255, 0.4)',
        'rgba(0, 136, 255, 0.3)',
        'rgba(255, 102, 0, 0.2)',
    ];

    function createParticle() {
        const el = document.createElement('div');
        const size = Math.random() * 4 + 1;
        const color = colors[Math.floor(Math.random() * colors.length)];
        el.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            pointer-events: none;
            box-shadow: 0 0 ${size * 3}px ${color};
        `;
        return {
            el,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4 - 0.1,
            life: Math.random() * 200 + 100,
            maxLife: Math.random() * 200 + 100,
        };
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = createParticle();
        container.appendChild(p.el);
        particles.push(p);
    }

    function animate() {
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;

            const alpha = p.life / p.maxLife;
            p.el.style.opacity = Math.min(alpha * 2, 0.8);
            p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;

            if (p.life <= 0 || p.x < -10 || p.x > window.innerWidth + 10 || p.y < -10) {
                p.x = Math.random() * window.innerWidth;
                p.y = window.innerHeight + 10;
                p.life = p.maxLife;
            }
        });
        requestAnimationFrame(animate);
    }

    animate();

    // Effet de répulsion au survol de la souris
    document.addEventListener('mousemove', (e) => {
        particles.forEach(p => {
            const dx = p.x - e.clientX;
            const dy = p.y - e.clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
                const force = (100 - dist) / 100;
                p.vx += (dx / dist) * force * 0.5;
                p.vy += (dy / dist) * force * 0.5;
            }
            // Limite la vitesse
            p.vx = Math.max(-2, Math.min(2, p.vx));
            p.vy = Math.max(-2, Math.min(2, p.vy));
        });
    });
})();
