/* ============================================================
   MEZUR — Main JavaScript
   GSAP + ScrollTrigger + Lenis smooth scroll
   ============================================================ */

'use strict';

/* ============ MOBILE DETECTION ============ */

const isMobile = () => window.innerWidth <= 768;
const isTouch = () => window.matchMedia('(hover: none)').matches;

/* ============ LENIS SMOOTH SCROLL ============ */

let lenis;

function initLenis() {
  // Skip smooth scroll on mobile — native scroll is better for performance
  if (isMobile()) return;

  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);
}

/* ============ PAGE LOADER ============ */

function initLoader() {
  const loader = document.querySelector('.loader');
  if (!loader) return;

  const loaderLogo = loader.querySelector('.loader-logo');
  const loaderLine = loader.querySelector('.loader-line');

  const tl = gsap.timeline({
    onComplete: () => {
      loader.style.pointerEvents = 'none';
      document.body.style.overflow = '';
    }
  });

  document.body.style.overflow = 'hidden';

  tl.to(loaderLogo, {
    opacity: 1,
    scale: 1,
    duration: 0.9,
    ease: 'power3.out',
    delay: 0.2,
  })
  .to(loaderLine, {
    height: 48,
    duration: 0.5,
    ease: 'power2.out',
  }, '-=0.4')
  .to(loader, {
    yPercent: -100,
    duration: 0.8,
    ease: 'power4.inOut',
    delay: 0.4,
  })
  .add(() => {
    initHeroAnimation();
  }, '-=0.5');
}

/* ============ HERO ANIMATIONS ============ */

function initHeroAnimation() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const eyebrow = hero.querySelector('.hero-eyebrow');
  const titleChars = hero.querySelectorAll('.hero-title .char');
  const tagline = hero.querySelector('.hero-tagline');
  const ctaGroup = hero.querySelector('.hero-cta-group');
  const scrollIndicator = hero.querySelector('.hero-scroll');

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (eyebrow) {
    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.8 }, 0.1);
  }

  if (titleChars.length > 0) {
    tl.to(titleChars, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.06,
      ease: 'power4.out',
    }, 0.3);
  }

  if (tagline) {
    tl.to(tagline, { opacity: 0.8, duration: 0.8 }, '-=0.2');
  }

  if (ctaGroup) {
    tl.to(ctaGroup, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4');
  }

  if (scrollIndicator) {
    tl.to(scrollIndicator, { opacity: 1, duration: 0.8 }, '-=0.2');
  }

  // Hero parallax — desktop only (mobile: performance + UX)
  if (!isMobile()) {
    const heroMedia = hero.querySelector('.hero-media');
    const heroContent = hero.querySelector('.hero-content');

    if (heroMedia) {
      gsap.to(heroMedia, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }

    if (heroContent) {
      gsap.to(heroContent, {
        yPercent: 15,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }
}

/* ============ STICKY NAV ============ */

function initNav() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const heroEl = document.querySelector('.hero, .page-hero');
  const heroHeight = heroEl ? heroEl.offsetHeight * 0.15 : 80;

  ScrollTrigger.create({
    start: `${heroHeight}px top`,
    onEnter: () => header.classList.add('is-solid'),
    onLeaveBack: () => header.classList.remove('is-solid'),
  });

  // Mobile nav toggle
  const toggle = header.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      header.classList.toggle('nav-open');
      const isOpen = header.classList.contains('nav-open');
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';

      // Animate hamburger → X
      const bars = toggle.querySelectorAll('span');
      if (isOpen) {
        gsap.to(bars[0], { rotation: 45, y: 6, duration: 0.25, ease: 'power2.out' });
        gsap.to(bars[1], { opacity: 0, duration: 0.15 });
        gsap.to(bars[2], { rotation: -45, y: -6, duration: 0.25, ease: 'power2.out' });
      } else {
        gsap.to(bars[0], { rotation: 0, y: 0, duration: 0.25, ease: 'power2.out' });
        gsap.to(bars[1], { opacity: 1, duration: 0.25 });
        gsap.to(bars[2], { rotation: 0, y: 0, duration: 0.25, ease: 'power2.out' });
      }
    });
  }

  // Close nav on link click (mobile)
  const navLinks = header.querySelectorAll('.main-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      header.classList.remove('nav-open');
      document.body.style.overflow = '';
      const bars = toggle ? toggle.querySelectorAll('span') : [];
      if (bars.length) {
        gsap.to(bars[0], { rotation: 0, y: 0, duration: 0.2 });
        gsap.to(bars[1], { opacity: 1, duration: 0.2 });
        gsap.to(bars[2], { rotation: 0, y: 0, duration: 0.2 });
      }
    });
  });
}

/* ============ CUSTOM CURSOR ============ */

function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;

  const lerp = (a, b, n) => a + (b - a) * n;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  function animateCursor() {
    curX = lerp(curX, mouseX, 0.35);
    curY = lerp(curY, mouseY, 0.35);
    cursor.style.left = `${curX}px`;
    cursor.style.top = `${curY}px`;
    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Hover states
  const imgEls = document.querySelectorAll('img, .dish-card, .menu-item-card, .about-portrait');
  imgEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering-img'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering-img'));
  });

  const linkEls = document.querySelectorAll('a, button, .btn, input, select, textarea');
  linkEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (!el.closest('.dish-card, .menu-item-card, .about-portrait')) {
        cursor.classList.add('is-hovering-link');
      }
    });
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering-link'));
  });
}

/* ============ MOBILE BOTTOM BAR ============ */

function initMobileBottomBar() {
  const bar = document.querySelector('.mobile-bottom-bar');
  if (!bar || !isMobile()) return;

  const hero = document.querySelector('.hero, .page-hero, .reservation-hero');
  const heroHeight = hero ? hero.offsetHeight * 0.6 : 300;

  // Hide bar during hero, show after
  ScrollTrigger.create({
    start: `${heroHeight}px top`,
    onEnter: () => bar.classList.remove('is-hidden'),
    onLeaveBack: () => bar.classList.add('is-hidden'),
  });

  // Start hidden
  bar.classList.add('is-hidden');

  // Hide bar near footer to avoid overlap
  const footer = document.querySelector('.site-footer');
  if (footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: 'top 90%',
      onEnter: () => bar.classList.add('is-hidden'),
      onLeaveBack: () => bar.classList.remove('is-hidden'),
    });
  }

  // Hide when scrolling down fast, show when scrolling up (scroll-aware UX)
  let lastScrollY = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;
        // Only auto-hide after hero
        if (currentY > heroHeight) {
          if (delta > 60) {
            bar.classList.add('is-hidden');
          } else if (delta < -20) {
            bar.classList.remove('is-hidden');
          }
        }
        lastScrollY = currentY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ============ SCROLL REVEAL ANIMATIONS ============ */

function initScrollReveal() {
  if (isMobile()) {
    initMobileReveal();
  } else {
    initDesktopReveal();
  }
}

/* Mobile: NO opacity pre-set (content always visible by default).
   Only subtle Y-translate with immediateRender:false so elements
   stay at their CSS default (y:0, opacity:1) until the trigger fires. */
function initMobileReveal() {
  const mobileAnim = (el, opts = {}) => {
    gsap.fromTo(el,
      { y: opts.y || 20 },
      {
        y: 0,
        duration: opts.duration || 0.5,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: {
          trigger: el,
          start: 'top 98%',
          once: true,
        },
      }
    );
  };

  gsap.utils.toArray('h2, h3').forEach(el => {
    if (el.closest('.hero, .loader')) return;
    mobileAnim(el, { y: 16 });
  });

  gsap.utils.toArray('.eyebrow, .section-tag').forEach(el => {
    mobileAnim(el, { y: 12 });
  });

  gsap.utils.toArray('.maison-text, .manifeste-intro p, .about-intro p, .maison-quote').forEach(el => {
    mobileAnim(el, { y: 16 });
  });

  gsap.utils.toArray('.img-reveal-wrap').forEach(wrap => {
    mobileAnim(wrap, { y: 20, duration: 0.6 });
  });

  gsap.utils.toArray('.pillar, .testimonial, .founder, .value-item').forEach(el => {
    mobileAnim(el, { y: 16, duration: 0.45 });
  });
}

/* Desktop: full GSAP animations with opacity + clip-path */
function initDesktopReveal() {
  gsap.utils.toArray('.eyebrow, .section-tag').forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 20, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  gsap.utils.toArray('h2, h3').forEach(el => {
    if (el.closest('.hero, .loader')) return;
    gsap.from(el, {
      opacity: 0, y: 40, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  gsap.utils.toArray('.maison-text, .manifeste-intro p, .about-intro p').forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 30, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  gsap.utils.toArray('.maison-quote').forEach(el => {
    gsap.from(el, {
      opacity: 0, x: -30, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%' },
    });
  });

  gsap.utils.toArray('.img-reveal-wrap').forEach(wrap => {
    const img = wrap.querySelector('img');
    if (!img) return;
    gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top 85%' } })
      .from(wrap, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1, ease: 'power4.inOut' })
      .from(img, { scale: 1.15, duration: 1, ease: 'power4.inOut' }, '<');
  });

  gsap.utils.toArray('.menu-entry, .value-item').forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 40, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  gsap.utils.toArray('.founder').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0, y: 20, duration: 0.6, ease: 'power2.out', delay: i * 0.1,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  gsap.utils.toArray('.will-reveal').forEach(el => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });
}

/* ============ RATING COUNT-UP ============ */
/* (runs on all devices — no opacity involved) */
function initRatingCountup() {
  const scoreEl = document.querySelector('.rating-score-display');
  if (!scoreEl) return;

  const target = 4.9;

  ScrollTrigger.create({
    trigger: scoreEl,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to({ val: 0 }, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: function () {
          scoreEl.textContent = this.targets()[0].val.toFixed(1);
        },
      });
    },
  });
}

/* ============ SIGNATURE DISH CARDS — Stagger ============ */

function initDishCards() {
  const grid = document.querySelector('.dishes-grid');
  if (!grid || isMobile()) return;

  const cards = grid.querySelectorAll('.dish-card, .dish-card-text');

  gsap.from(cards, {
    opacity: 0,
    y: 60,
    duration: 0.9,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: grid,
      start: 'top 80%',
    },
  });
}

/* ============ MENU HORIZONTAL SCROLL ============ */

function initMenuScroll() {
  const track = document.querySelector('.menu-scroll-track');
  const fill = document.querySelector('.menu-progress-fill');
  if (!track || !fill) return;

  // Update progress bar
  function updateProgress() {
    const max = track.scrollWidth - track.clientWidth;
    if (max <= 0) return;
    const progress = (track.scrollLeft / max) * 100;
    fill.style.width = `${progress}%`;
  }

  track.addEventListener('scroll', updateProgress, { passive: true });

  // Drag to scroll
  let isDown = false;
  let startX;
  let scrollLeftStart;

  track.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeftStart = track.scrollLeft;
    track.style.cursor = 'grabbing';
  });

  track.addEventListener('mouseleave', () => {
    isDown = false;
    track.style.cursor = 'grab';
  });

  track.addEventListener('mouseup', () => {
    isDown = false;
    track.style.cursor = 'grab';
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollLeftStart - walk;
  });
}

/* ============ PILLARS ANIMATION ============ */

function initPillars() {
  const pillars = document.querySelectorAll('.pillar');
  if (!pillars.length || isMobile()) return;

  gsap.from(pillars, {
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.pillars',
      start: 'top 80%',
    },
  });
}

/* ============ TESTIMONIALS ============ */

function initTestimonials() {
  const testimonials = document.querySelectorAll('.testimonial');
  if (!testimonials.length || isMobile()) return;

  gsap.from(testimonials, {
    opacity: 0,
    y: 50,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.testimonials-grid',
      start: 'top 80%',
    },
  });
}

/* ============ CTA SECTION ============ */

function initCTASection() {
  const cta = document.querySelector('.cta-reservation-content');
  if (!cta || isMobile()) return;

  gsap.from(cta.children, {
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: cta,
      start: 'top 80%',
    },
  });
}

/* ============ PAGE TRANSITIONS ============ */

function initPageTransitions() {
  const links = document.querySelectorAll('a[href]');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('tel:') ||
        href.startsWith('mailto:') || href.startsWith('http')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();

      const overlay = document.querySelector('.page-transition-overlay');
      if (!overlay) {
        window.location.href = href;
        return;
      }

      gsap.to(overlay, {
        scaleY: 1,
        duration: 0.5,
        ease: 'power3.in',
        transformOrigin: 'bottom',
        onComplete: () => {
          window.location.href = href;
        },
      });
    });
  });

  // Reveal on load
  const overlay = document.querySelector('.page-transition-overlay');
  if (overlay) {
    gsap.set(overlay, { scaleY: 1, transformOrigin: 'top' });
    gsap.to(overlay, {
      scaleY: 0,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.1,
    });
  }
}

/* ============ FORM HANDLING ============ */

function initForm() {
  const form = document.querySelector('.reservation-form-el');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formContent = form.querySelector('.form-fields');
    const success = form.querySelector('.form-success');

    if (!formContent || !success) return;

    gsap.to(formContent, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        formContent.style.display = 'none';
        success.classList.add('visible');
        gsap.from(success, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power2.out',
        });
      },
    });
  });
}

/* ============ ACTIVE NAV LINK ============ */

function setActiveNavLink() {
  const links = document.querySelectorAll('.main-nav a');
  const current = window.location.pathname.split('/').pop() || 'index.html';

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('/').pop();
    if (linkPage === current || (current === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ============ LETTER SPLITTING (manual) ============ */

function splitHeroTitle() {
  const title = document.querySelector('.hero-title');
  if (!title) return;

  const text = title.textContent.trim();
  title.textContent = '';
  title.setAttribute('aria-label', text);

  text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char === ' ' ? ' ' : char;
    span.style.display = 'inline-block';
    title.appendChild(span);
  });
}

/* ============ FOOTER REVEAL ============ */

function initFooter() {
  const footerCols = document.querySelectorAll('.footer-col, .footer-logo-block');
  if (!footerCols.length || isMobile()) return;

  gsap.from(footerCols, {
    opacity: 0,
    y: 30,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.site-footer',
      start: 'top 90%',
    },
  });
}

/* ============ STICKY RESERVE BUTTON (menu page) ============ */

function initStickyReserve() {
  const btn = document.querySelector('.sticky-reserve');
  if (!btn) return;

  const hero = document.querySelector('.page-hero');
  const heroEnd = hero ? hero.offsetHeight : 300;

  ScrollTrigger.create({
    start: `${heroEnd}px top`,
    end: '95% bottom',
    onEnter: () => btn.classList.add('is-visible'),
    onLeaveBack: () => btn.classList.remove('is-visible'),
    onLeave: () => btn.classList.remove('is-visible'),
  });
}

/* ============ INIT ============ */

function init() {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // Disable default scroll before lenis
  if (typeof Lenis !== 'undefined') {
    initLenis();
  }

  setActiveNavLink();
  initNav();
  if (!isTouch()) initCursor();
  splitHeroTitle();
  initMobileBottomBar();

  // Check if on homepage (has loader)
  const loader = document.querySelector('.loader');
  if (loader) {
    initLoader();
  } else {
    // On secondary pages, run hero animation immediately
    const pageHero = document.querySelector('.page-hero');
    if (pageHero) {
      gsap.from('.page-hero-content h1', {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        delay: 0.3,
      });
      gsap.from('.page-hero-content .eyebrow', {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: 'power2.out',
        delay: 0.15,
      });
    }
  }

  // Scroll-triggered animations
  initScrollReveal();
  initRatingCountup();
  initDishCards();
  initMenuScroll();
  initPillars();
  initTestimonials();
  initCTASection();
  initFooter();
  initPageTransitions();
  initForm();
  initStickyReserve();

  // Refresh ScrollTrigger after images load
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
