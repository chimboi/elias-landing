/* ============================================================
   Elías Huarte — script.js
   Maneja: menú móvil, carruseles, animaciones on-scroll, smooth scroll
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initCarousels();
  initScrollAnimations();
  initSmoothScroll();
});

/* ---------- 1. Menú móvil (hamburger) ---------- */
function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  const close = () => {
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  };
  const open = () => {
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
  };

  toggle.addEventListener('click', () => {
    document.body.classList.contains('nav-open') ? close() : open();
  });

  // Cierra el menú al hacer click en un link
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

/* ---------- 2. Carruseles ---------- */
function initCarousels() {
  document.querySelectorAll('.carousel').forEach(createCarousel);
}

/**
 * Convierte un elemento .carousel en un carrusel funcional.
 * Soporta: botones prev/next, dots, teclado y swipe táctil.
 */
function createCarousel(root) {
  const track = root.querySelector('.carousel-track');
  const cards = Array.from(root.querySelectorAll('.carousel-card'));
  const prevBtn = root.querySelector('.carousel-prev');
  const nextBtn = root.querySelector('.carousel-next');
  const dotsContainer = root.querySelector('.carousel-dots');
  if (!track || cards.length === 0) return;

  let current = 0;
  const total = cards.length;

  // ARIA: etiquetar cada slide
  cards.forEach((card, i) => {
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `${i + 1} de ${total}`);
  });

  // Crear dots dinámicamente
  const dots = [];
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Ir al slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
    dots.push(dot);
  }

  // Mueve el track a la posición indicada
  function goTo(index) {
    current = (index + total) % total; // wrap-around
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    cards.forEach((c, i) => c.setAttribute('aria-hidden', i !== current));
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  // Teclado (sólo cuando el carrusel tiene foco)
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });

  // Swipe táctil
  let touchStartX = 0;
  let touchDeltaX = 0;
  const SWIPE_THRESHOLD = 50;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchDeltaX = 0;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    touchDeltaX = e.touches[0].clientX - touchStartX;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (Math.abs(touchDeltaX) > SWIPE_THRESHOLD) {
      goTo(touchDeltaX < 0 ? current + 1 : current - 1);
    }
  });

  // Estado inicial
  goTo(0);
}

/* ---------- 3. Animaciones on-scroll ---------- */
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length || !('IntersectionObserver' in window)) {
    // Fallback: mostrar todo inmediatamente
    elements.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ---------- 4. Smooth scroll para anchors internos ---------- */
function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
