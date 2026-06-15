/* ============================================================
   MEZUR — Couche de contenu (content layer)
   Source unique de vérité pour le contenu éditable du site.

   Stockage : localStorage (démo front-only).
   → Pour brancher un vrai backend plus tard, il suffit de
     remplacer les méthodes get/save de MezurContent par des
     appels réseau. Le reste du site n'a pas à changer.
   ============================================================ */

'use strict';

(function (window) {
  const STORAGE_KEY = 'mezur_content';
  const RES_KEY = 'mezur_reservations';

  /* ---------- Contenu par défaut (= site livré) ---------- */
  const DEFAULT_CONTENT = {
    images: {
      maisonAccueil:   'images/c00db5_538c3ea595f149ff92b5a81289f64af6~mv2.avif',
      pierrePortrait:  'images/c00db5_538c3ea595f149ff92b5a81289f64af6~mv2.avif',
      thomasPortrait:  'images/Trinquer avec verres de vin.avif',
      aproposHero:     'images/c837a6_b8d8d3abc0454d2ba22d8bc30dd2bd89~mv2.avif',
      menuHero:        'images/Plat gastronomique.avif',
      platSignature1:  'images/Plat gastronomique.avif',
      platSignature2:  'images/11062b_0234bac6aabb4d45af0cbe02be372826f000.avif',
      ctaFond:         'images/Trinquer avec verres de vin.avif',
      reservationFond: 'images/c837a6_b8d8d3abc0454d2ba22d8bc30dd2bd89~mv2.avif'
    },

    texts: {
      // Slogan affiché sur la page d'accueil (site d'origine)
      heroTagline:    "« Chaque assiette est un chef-d'œuvre... »",
      // Paragraphe de bienvenue (site d'origine)
      manifesteIntro: "Un restaurant où l'art de la gastronomie se mêle à une ambiance chaleureuse et épurée. Ici, chaque détail, des plats soigneusement élaborés à l'accueil attentif, est pensé pour offrir une expérience culinaire authentique et agréable. Mezur vous invite à découvrir une cuisine qui met en avant la simplicité et la qualité, dans un cadre où l'élégance discrète crée une atmosphère propice à la détente et à la dégustation.",
      // Concept du chef (site d'origine, page « À propos »)
      maisonQuote:    "« MEZUR est une expérience gastronomique authentique, où l'équilibre et la mesure guident chaque création. »",
      // Histoire (site d'origine, page « À propos »)
      maisonText1:    "MEZUR est né de la passion commune de Pierre et Thomas Souptez pour la gastronomie et le vin. Ensemble, ils ont créé un lieu de partage et de convivialité, où la cuisine raffinée et la sélection des vins se répondent harmonieusement.",
      maisonText2:    "Leur histoire est celle de deux frères animés par le goût, le produit et le désir de faire vivre à chaque convive un moment agréable, gourmand et inoubliable.",
      aproposIntro:   "Chez MEZUR, Pierre incarne l'élégance de la simplicité. Animé par une grande précision technique, il propose une cuisine raffinée où chaque ingrédient est soigneusement mis en valeur."
    },

    // Menu de la maison (servi le midi uniquement du lundi au vendredi, hors
    // jours fériés). Formule : plat seul 19 € / entrée-plat ou plat-dessert 24 €
    // / entrée-plat-dessert 29 €. Le site d'origine ne détaille ni description
    // ni prix par plat — on n'invente donc rien.
    menu: {
      // Formules du menu de la maison (servi le midi, lundi–vendredi)
      formules: [
        { nom: 'Plat seul',                      desc: 'Menu de la maison — midi uniquement (lun.–ven.)', prix: '19 €' },
        { nom: 'Entrée + Plat  ou  Plat + Dessert', desc: 'Menu de la maison — midi uniquement (lun.–ven.)', prix: '24 €' },
        { nom: 'Entrée + Plat + Dessert',         desc: 'Menu de la maison — midi uniquement (lun.–ven.)', prix: '29 €' }
      ],
      entrees: [
        { nom: 'Tomates, Burrata',        desc: '', prix: '' },
        { nom: 'Œuf mollet, Mousseline',  desc: '', prix: '' }
      ],
      plats: [
        { nom: 'Orichiettes, crevettes & bisque', desc: '', prix: '' },
        { nom: 'Blanquette de veau',              desc: '', prix: '' }
      ],
      desserts: [
        { nom: "Fraises, Herbes, Huile d'olive", desc: '', prix: '' },
        { nom: 'Pavlova, Citron',                 desc: '', prix: '' }
      ],
      // Le site d'origine ne publie pas de carte des vins nommée.
      vins: []
    },

    hours: [
      { jour: 'Lundi',    texte: '12h00–14h00  ·  19h00–22h00', ferme: false },
      { jour: 'Mardi',    texte: '12h00–14h00  ·  19h00–22h00', ferme: false },
      { jour: 'Mercredi', texte: '12h00–14h00  ·  19h00–22h00', ferme: false },
      { jour: 'Jeudi',    texte: '12h00–14h00  ·  19h00–22h00', ferme: false },
      { jour: 'Vendredi', texte: '12h00–14h00  ·  19h00–22h00', ferme: false },
      { jour: 'Samedi',   texte: '12h00–14h00  ·  19h00–22h00', ferme: false },
      { jour: 'Dimanche', texte: 'Fermé', ferme: true }
    ],

    contact: {
      adresse: "4 Pl. de l'Université\n26000 Valence\nFrance",
      tel: '04 75 41 22 86',
      email: 'mezurvalence@gmail.com',
      instagram: 'Instagram'
    }
  };

  /* ---------- Utilitaires ---------- */
  function deepMerge(base, override) {
    if (Array.isArray(base)) return override !== undefined ? override : base;
    if (typeof base !== 'object' || base === null) {
      return override !== undefined ? override : base;
    }
    const out = {};
    Object.keys(base).forEach((k) => {
      out[k] = (override && k in override) ? deepMerge(base[k], override[k]) : base[k];
    });
    if (override) {
      Object.keys(override).forEach((k) => { if (!(k in out)) out[k] = override[k]; });
    }
    return out;
  }

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function getByPath(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }

  /* ---------- API publique ---------- */
  const MezurContent = {
    DEFAULT: DEFAULT_CONTENT,

    get() {
      let stored = null;
      try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
      catch (e) { stored = null; }
      return stored ? deepMerge(DEFAULT_CONTENT, stored) : clone(DEFAULT_CONTENT);
    },

    save(content) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    },

    reset() {
      localStorage.removeItem(STORAGE_KEY);
    },

    export() {
      return JSON.stringify(this.get(), null, 2);
    },

    import(jsonString) {
      const obj = JSON.parse(jsonString);
      this.save(obj);
      return obj;
    },

    /* --- Réservations --- */
    getReservations() {
      try { return JSON.parse(localStorage.getItem(RES_KEY) || '[]'); }
      catch (e) { return []; }
    },
    saveReservations(list) {
      localStorage.setItem(RES_KEY, JSON.stringify(list));
    },
    addReservation(res) {
      const list = this.getReservations();
      res.id = 'res_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      res.createdAt = new Date().toISOString();
      res.status = res.status || 'nouvelle';
      list.push(res);
      this.saveReservations(list);
      return res;
    },

    /* ---------- Hydratation des pages publiques ---------- */
    hydrate() {
      const c = this.get();

      // 1) Images via attribut src (ou autre attribut via data-mz-attr)
      document.querySelectorAll('[data-mz-img]').forEach((el) => {
        const val = getByPath(c, el.getAttribute('data-mz-img'));
        if (!val) return;
        const attr = el.getAttribute('data-mz-attr') || 'src';
        el.setAttribute(attr, val);
      });

      // 2) Images de fond CSS → variables CSS sur :root
      const root = document.documentElement;
      if (c.images.ctaFond) root.style.setProperty('--mz-cta-bg', `url("${cssUrl(c.images.ctaFond)}")`);
      if (c.images.reservationFond) root.style.setProperty('--mz-reservation-bg', `url("${cssUrl(c.images.reservationFond)}")`);

      // 3) Textes
      document.querySelectorAll('[data-mz-text]').forEach((el) => {
        const val = getByPath(c, el.getAttribute('data-mz-text'));
        if (val != null) el.textContent = val;
      });

      // 4) Menu
      renderMenu(c);

      // 5) Horaires
      renderHours(c);

      // 6) Contact
      renderContact(c);
    }
  };

  /* Échappe les chemins de fichier (espaces, etc.) pour url() CSS.
     Les dataURL passent inchangés. */
  function cssUrl(src) {
    if (src.startsWith('data:')) return src;
    return src.replace(/"/g, '\\"');
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function entryMarkup(item) {
    return (
      '<div class="menu-entry">' +
        '<div class="menu-entry-left">' +
          '<p class="menu-entry-name">' + esc(item.nom) + '</p>' +
          (item.desc ? '<p class="menu-entry-desc">' + esc(item.desc) + '</p>' : '') +
        '</div>' +
        (item.prix ? '<span class="menu-entry-price">' + esc(item.prix) + '</span>' : '') +
      '</div>'
    );
  }

  function vinMarkup(item) {
    return (
      '<div class="menu-entry" style="border-bottom-color: rgba(255,255,255,0.1);">' +
        '<div class="menu-entry-left">' +
          '<p class="menu-entry-name" style="color: var(--blanc);">' + esc(item.nom) + '</p>' +
          '<p class="menu-entry-desc" style="color: rgba(255,255,255,0.45);">' + esc(item.desc) + '</p>' +
        '</div>' +
        '<span class="menu-entry-price" style="color: var(--or);">' + esc(item.prix) + '</span>' +
      '</div>'
    );
  }

  function renderMenu(c) {
    const map = {
      formules:  entryMarkup,
      entrees:   entryMarkup,
      plats:     entryMarkup,
      desserts:  entryMarkup,
      vins:      vinMarkup
    };
    Object.keys(map).forEach((section) => {
      const container = document.querySelector('[data-mz-menu="' + section + '"]');
      if (!container) return;
      const items = (c.menu && c.menu[section]) || [];
      container.innerHTML = items.map(map[section]).join('');
    });
  }

  function renderHours(c) {
    // Grille détaillée (réservations)
    const grid = document.querySelector('[data-mz-hours="grid"]');
    if (grid) {
      grid.innerHTML = c.hours.map((h) => (
        '<span class="hours-day">' + esc(h.jour) + '</span>' +
        '<span' + (h.ferme ? ' class="hours-closed"' : '') + '>' + esc(h.texte) + '</span>'
      )).join('');
    }
    // Résumé (footers)
    document.querySelectorAll('[data-mz-hours="summary"]').forEach((el) => {
      el.innerHTML = c.hours
        .map((h) => esc(h.jour) + ' : ' + esc(h.texte))
        .join('<br>');
    });
  }

  function renderContact(c) {
    document.querySelectorAll('[data-mz-contact="adresse"]').forEach((el) => {
      el.innerHTML = esc(c.contact.adresse).replace(/\n/g, '<br>');
    });
    document.querySelectorAll('[data-mz-contact="tel"]').forEach((el) => {
      el.textContent = c.contact.tel;
      const digits = c.contact.tel.replace(/[^0-9+]/g, '');
      el.setAttribute('href', 'tel:' + (digits.startsWith('+') ? digits : '+33' + digits.replace(/^0/, '')));
    });
    document.querySelectorAll('[data-mz-contact="instagram"]').forEach((el) => {
      el.textContent = c.contact.instagram;
    });
    document.querySelectorAll('[data-mz-contact="email"]').forEach((el) => {
      if (!c.contact.email) return;
      el.textContent = c.contact.email;
      el.setAttribute('href', 'mailto:' + c.contact.email);
    });
  }

  window.MezurContent = MezurContent;

  // Hydratation automatique des pages publiques (l'admin n'inclut pas ce comportement)
  if (!window.MEZUR_NO_AUTOHYDRATE) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => MezurContent.hydrate());
    } else {
      MezurContent.hydrate();
    }
  }
})(window);
