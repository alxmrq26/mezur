/* ============================================================
   MEZUR, Comportements du site public

   Aucune dépendance externe. Le contenu est lisible sans
   JavaScript : ce fichier n'ajoute que des améliorations
   (apparitions au défilement, menu mobile, vidéo du hero).
   ============================================================ */

'use strict';

(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(min-width: 900px)');

  /* ---------- Apparitions au défilement ---------- */

  function initReveals() {
    const items = document.querySelectorAll('.will-reveal');
    if (!items.length) return;

    // Sans IntersectionObserver ou en mouvement réduit, on ne masque rien.
    if (!('IntersectionObserver' in window) || reduceMotion.matches) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    items.forEach((el) => {
      // Ce qui est déjà à l'écran reste affiché tel quel : on n'anime
      // que ce que la personne n'a pas encore vu.
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('is-armed');
      io.observe(el);
    });

    // Filet de sécurité : au bout de 3 s, plus AUCUN bloc ne reste
    // masqué, où qu'il soit dans la page. En lecture normale
    // l'observateur a déjà fait son travail bien avant ; ce délai ne
    // sert qu'aux cas où il ne se déclenche jamais (rendu sans
    // défilement, capture d'aperçu, onglet resté en arrière-plan).
    window.setTimeout(() => {
      document.querySelectorAll('.will-reveal.is-armed:not(.is-revealed)')
        .forEach((el) => el.classList.add('is-revealed'));
    }, 3000);
  }

  /* ---------- En-tête au défilement ---------- */

  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    // Les pages intérieures posent déjà .is-solid dans le HTML.
    if (header.classList.contains('is-solid') && !document.querySelector('.hero')) return;

    const hero = document.querySelector('.hero');
    const seuil = hero ? hero.offsetHeight * 0.15 : 80;
    let ticking = false;

    function update() {
      header.classList.toggle('is-solid', window.scrollY > seuil);
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  /* ---------- Menu mobile ---------- */

  function initNav() {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('nav-principale');
    if (!header || !toggle || !nav) return;

    function focusables() {
      return nav.querySelectorAll('a[href], button:not([disabled])');
    }

    function setOpen(open) {
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        const first = focusables()[0];
        if (first) first.focus();
      } else {
        toggle.focus();
      }
    }

    toggle.addEventListener('click', () => {
      setOpen(!header.classList.contains('nav-open'));
    });

    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (!header.classList.contains('nav-open')) return;

      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }

      // Le focus reste dans le menu tant qu'il est ouvert.
      if (e.key !== 'Tab') return;
      const list = Array.prototype.slice.call(focusables());
      list.push(toggle);
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // Le menu plein écran n'a plus de raison d'être sur grand écran.
    finePointer.addEventListener('change', (e) => {
      if (e.matches && header.classList.contains('nav-open')) setOpen(false);
    });
  }

  /* ---------- Vidéo du hero ---------- */

  function initHeroVideo() {
    const video = document.querySelector('.hero-media video');
    if (!video) return;

    // En mouvement réduit, on s'en tient à l'image fixe.
    if (reduceMotion.matches) {
      video.removeAttribute('autoplay');
      video.pause();
      return;
    }

    function play() {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    }

    play();

    // Certains navigateurs refusent la lecture avant une interaction.
    ['touchstart', 'click'].forEach((evt) => {
      document.addEventListener(evt, function once() {
        play();
        document.removeEventListener(evt, once);
      }, { once: true, passive: true });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') play();
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) play();
          else video.pause();
        });
      }, { threshold: 0.1 });
      io.observe(video);
    }
  }

  /* ---------- Barre de réservation mobile ---------- */

  function initMobileBar() {
    const bar = document.querySelector('.mobile-bottom-bar');
    if (!bar) return;

    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      const bas = y + window.innerHeight >= document.body.scrollHeight - 120;
      // On l'escamote en descente rapide, jamais en bas de page.
      bar.classList.toggle('is-hidden', y > lastY + 8 && y > 320 && !bas);
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });
  }

  /* ---------- Carrousel de la carte ---------- */

  function initMenuCarousel() {
    const track = document.querySelector('.menu-scroll-track');
    const fill = document.querySelector('.menu-progress-fill');
    if (!track) return;

    function update() {
      if (!fill) return;
      const max = track.scrollWidth - track.clientWidth;
      const ratio = max > 0 ? track.scrollLeft / max : 0;
      const visible = Math.max(track.clientWidth / track.scrollWidth, 0.12);
      // Largeur fixe, on ne joue que sur l'échelle et la position.
      const decalage = ratio * (1 - visible) * 100;
      fill.style.transform = 'translateX(' + decalage + '%) scaleX(' + visible + ')';
    }

    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- CTA flottant de la page carte ---------- */

  function initStickyReserve() {
    const cta = document.querySelector('.sticky-reserve');
    if (!cta || !('IntersectionObserver' in window)) return;

    const repere = document.querySelector('.menu-page') || document.querySelector('main');
    if (!repere) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        cta.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.05 });

    io.observe(repere);
  }

  /* ---------- Démarrage ---------- */

  function init() {
    initHeader();
    initNav();
    initHeroVideo();
    initReveals();
    initMobileBar();
    initMenuCarousel();
    initStickyReserve();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
