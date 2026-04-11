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

  // Mueve el track a la posición indicada.
  // Clamp a [0, total-1]: el carrusel NO da la vuelta, se queda en los bordes.
  function goTo(index) {
    const clamped = Math.max(0, Math.min(total - 1, index));
    current = clamped;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    cards.forEach((c, i) => c.setAttribute('aria-hidden', i !== current));
    updateButtons();
  }

  // Deshabilita visualmente los botones cuando estás en los extremos
  function updateButtons() {
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total - 1;
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  // Teclado (sólo cuando el carrusel tiene foco)
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });

  // Swipe táctil: distinguimos scroll vertical de swipe horizontal
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let touchDeltaY = 0;
  let touchActive = false;
  const SWIPE_THRESHOLD = 50;

  track.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchDeltaX = 0;
    touchDeltaY = 0;
    touchActive = true;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!touchActive) return;
    touchDeltaX = e.touches[0].clientX - touchStartX;
    touchDeltaY = e.touches[0].clientY - touchStartY;
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (!touchActive) return;
    touchActive = false;
    // Sólo disparamos swipe si el movimiento horizontal domina al vertical
    // y si superó el umbral mínimo — así no interferimos con el scroll vertical
    if (Math.abs(touchDeltaX) > SWIPE_THRESHOLD && Math.abs(touchDeltaX) > Math.abs(touchDeltaY)) {
      goTo(touchDeltaX < 0 ? current + 1 : current - 1);
    }
  });

  track.addEventListener('touchcancel', () => { touchActive = false; });

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
