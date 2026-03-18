/**
 * Universe Reborn — Animations GSAP + utilitaires
 */
document.addEventListener('DOMContentLoaded', () => {

    // ---- LOADING SCREEN ----
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 1800);
    }

    // ---- NAVBAR SCROLL ----
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const onScroll = () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // ---- MENU BURGER (mobile) ----
    const burger = document.getElementById('nav-burger');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    if (burger) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            if (navLinks) navLinks.classList.toggle('open');
            if (navActions) navActions.classList.toggle('open');
        });
    }

    // ---- SCROLL REVEAL ----
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        revealElements.forEach(el => observer.observe(el));
    }

    // ---- GSAP ANIMATIONS (si disponible) ----
    if (typeof gsap !== 'undefined') {
        // Entrée de la navbar
        gsap.from('.navbar', { y: -80, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 1.9 });

        // Registrer ScrollTrigger si disponible
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);

            // Animer les cards de mondes au scroll
            gsap.utils.toArray('.world-card').forEach((card, i) => {
                gsap.from(card, {
                    scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
                    opacity: 0, y: 40, duration: 0.6, delay: i * 0.08, ease: 'power2.out'
                });
            });

            // Animer les news cards
            gsap.utils.toArray('.news-card').forEach((card, i) => {
                gsap.from(card, {
                    scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
                    opacity: 0, y: 30, duration: 0.5, delay: i * 0.1, ease: 'power2.out'
                });
            });

            // Section Discord
            gsap.from('.discord-card', {
                scrollTrigger: { trigger: '.discord-section', start: 'top 70%' },
                opacity: 0, scale: 0.95, duration: 0.7, ease: 'back.out(1.2)'
            });
        }
    }

    // ---- FERMETURE AUTO DES FLASH MESSAGES ----
    document.querySelectorAll('.flash').forEach(flash => {
        setTimeout(() => flash.remove(), 5000);
    });
});
