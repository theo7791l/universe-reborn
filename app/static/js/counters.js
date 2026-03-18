/**
 * Universe Reborn — Compteurs animés
 * Anime les chiffres de la hero section
 */
document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('[data-target]');
    if (counters.length === 0) return;

    const animateCounter = (el, target, duration = 1500) => {
        const start = 0;
        const startTime = performance.now();
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            el.textContent = Math.floor(eased * (target - start) + start).toLocaleString('fr-FR');
            if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target, 10);
                if (!isNaN(target)) animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
});
