/* ============================================================
   MEZUR, Couche de contenu (content layer)
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

    // Textes rédigés d'après la section 11 du benchmark de direction
    // artistique : voix sobre, affirmative, personnelle. Les adjectifs
    // « savoureux », « délicieux », « exceptionnel » y sont bannis, et
    // Pierre et Thomas sont nommés plutôt que « l'équipe ».
    texts: {
      heroTagline:    "La précision au service du plaisir.",
      manifesteIntro: "MEZUR est né d'une obsession : faire juste. Pierre cuisine, Thomas choisit les vins. Le nom dit le reste, la mesure, rien en excès.",
      maisonQuote:    "Pierre cuisine. Thomas sélectionne les vins. Ensemble, ils créent les conditions du plaisir.",
      maisonText1:    "Deux frères, une brasserie ouverte en 2026 au cœur de Valence. L'un vient de la cuisine, l'autre du vin. Ils ont monté MEZUR pour mettre les deux dans la même pièce.",
      maisonText2:    "Le reste tient en une idée : servir ce qu'on aimerait qu'on nous serve.",
      aproposIntro:   "Pierre travaille court : peu d'éléments dans l'assiette, chacun à sa place. C'est une cuisine qui se lit."
    },

    // Menu de la maison (servi le midi uniquement du lundi au vendredi, hors
    // jours fériés). Formule : plat seul 19 € / entrée-plat ou plat-dessert 24 €
    // / entrée-plat-dessert 29 €. Le site d'origine ne détaille ni description
    // ni prix par plat, on n'invente donc rien.
    menu: {
      // Formules du menu de la maison (servi le midi, lundi–vendredi)
      formules: [
        { nom: 'Plat seul',                      desc: 'Menu de la maison, midi uniquement (lun.–ven.)', prix: '19 €' },
        { nom: 'Entrée + Plat  ou  Plat + Dessert', desc: 'Menu de la maison, midi uniquement (lun.–ven.)', prix: '24 €' },
        { nom: 'Entrée + Plat + Dessert',         desc: 'Menu de la maison, midi uniquement (lun.–ven.)', prix: '29 €' }
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
      // Ces quatre références étaient codées en dur dans menu.html. Elles
      // sont remontées ici pour être modifiables depuis le back-office.
      // À faire confirmer par Thomas : bouteilles réellement en cave et
      // prix à jour.
      vins: [
        { nom: 'Crozes-Hermitage Blanc',    desc: 'Domaine du Murinais · Marsanne, Roussanne · Drôme', prix: '38 € / btl' },
        { nom: 'Saint-Joseph Rouge',        desc: 'Yves Cuilleron · Syrah · Vallée du Rhône',          prix: '52 € / btl' },
        { nom: 'Champagne Blanc de Blancs', desc: 'Pierre Peters · Extra Brut · Côte des Blancs',      prix: '88 € / btl' },
        { nom: 'Côtes du Rhône Rosé',       desc: 'Château Maris · Grenache, Cinsault · Languedoc',    prix: '28 € / btl' }
      ]
    },

    // Source unique des horaires pour tout le site : footers, barre
    // mobile, page de réservation et créneaux du formulaire.
    hours: [
      { jour: 'Lundi',    texte: '12h–14h · 19h–22h', ferme: false },
      { jour: 'Mardi',    texte: '12h–14h · 19h–22h', ferme: false },
      { jour: 'Mercredi', texte: '12h–14h · 19h–22h', ferme: false },
      { jour: 'Jeudi',    texte: '12h–14h · 19h–22h', ferme: false },
      { jour: 'Vendredi', texte: '12h–14h · 19h–22h', ferme: false },
      { jour: 'Samedi',   texte: '12h–14h · 19h–22h', ferme: false },
      { jour: 'Dimanche', texte: 'Fermé', ferme: true }
    ],

    contact: {
      adresse: "4 Rue de l'Université\n26000 Valence",
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
     Les dataURL passent inchangés.

     Le chemin est résolu en URL absolue : une url() portée par une
     custom property est interprétée relativement à la feuille de
     styles qui la consomme (css/), pas au document. Un chemin relatif
     pointait donc vers css/images/… et l'image ne se chargeait pas. */
  function cssUrl(src) {
    if (src.startsWith('data:')) return src;
    try {
      return new URL(src, document.baseURI).href.replace(/"/g, '\\"');
    } catch (e) {
      return src.replace(/"/g, '\\"');
    }
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

  // Les couleurs sur fond navy sont portées par .menu-section--dark
  // dans la feuille de styles, plus par des attributs style en ligne.
  function vinMarkup(item) {
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

    // Regroupé : les jours consécutifs partageant le même horaire sont
    // fusionnés en une plage. Les horaires n'existent qu'ici, ce qui
    // évite les versions contradictoires d'une page à l'autre.
    const plages = groupHours(c.hours);

    document.querySelectorAll('[data-mz-hours="compact"]').forEach((el) => {
      el.innerHTML = plages
        .map((p) => esc(p.libelle) + '<br>' + esc(p.texte))
        .join('<br>');
    });

    // Une seule ligne, pour la barre de réservation mobile.
    document.querySelectorAll('[data-mz-hours="inline"]').forEach((el) => {
      const ouverts = plages.filter((p) => !p.ferme);
      el.textContent = (ouverts[0] ? ouverts[0].libelle : '') + ' · Valence';
    });
  }

  // ['Lundi'..'Samedi' identiques, 'Dimanche' fermé]
  //   → [{ libelle: 'Lundi – Samedi', texte: '…' }, { libelle: 'Dimanche', … }]
  function groupHours(hours) {
    const out = [];
    hours.forEach((h) => {
      const last = out[out.length - 1];
      if (last && last.texte === h.texte && last.ferme === !!h.ferme) {
        last.fin = h.jour;
      } else {
        out.push({ debut: h.jour, fin: null, texte: h.texte, ferme: !!h.ferme });
      }
    });
    return out.map((p) => ({
      libelle: p.fin ? p.debut + ' – ' + p.fin : p.debut,
      texte: p.texte,
      ferme: p.ferme
    }));
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
