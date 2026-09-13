/* ============================================================
   MEZUR, accès aux données du back office

   Deux modes, choisis automatiquement :

   · /api/reservations répond  -> les réservations viennent du serveur
     et sont visibles depuis n'importe quel appareil. La fonction
     serverless lit Supabase avec la clé de service et vérifie le
     cookie de session posé par /api/admin-auth.

   · la fonction est absente   -> repli sur le stockage local du
     navigateur. Pratique pour ouvrir le fichier directement, mais les
     données ne sortent pas de cet appareil : l'interface le dit.

   Aucune clé Supabase ne transite par cette page : le navigateur ne
   parle qu'à /api/reservations, sur la même origine.

   Les lectures se font depuis un cache mémoire, pour que le reste du
   back office reste synchrone.
   ============================================================ */

'use strict';

(function (window) {

  const API = '/api/reservations';

  let cache = [];
  // null = pas encore testé, true/false = verdict connu
  let serveurDisponible = null;

  function local() {
    return serveurDisponible === false;
  }

  async function appel(methode, options) {
    const res = await fetch(API + ((options && options.query) || ''), {
      method: methode,
      credentials: 'same-origin',
      headers: options && options.body ? { 'Content-Type': 'application/json' } : undefined,
      body: options && options.body ? JSON.stringify(options.body) : undefined
    });

    // Ni fonction déployée, ni route (501 : serveur statique qui ne
    // sait pas traiter la méthode) : on bascule en mode local.
    if ([404, 405, 501].indexOf(res.status) !== -1) {
      const err = new Error('Fonction absente');
      err.absente = true;
      throw err;
    }

    if (res.status === 401) {
      throw new Error('Session expirée. Rechargez la page et reconnectez-vous.');
    }

    if (!res.ok) {
      let message = 'Erreur serveur (' + res.status + ')';
      try {
        const corps = await res.json();
        if (corps && corps.error) message = corps.error;
      } catch (e) { /* réponse non JSON */ }
      throw new Error(message);
    }

    return res.status === 204 ? null : res.json();
  }

  /* Le site a longtemps écrit « pending » et « created » là où le back
     office attend « nouvelle » et « createdAt » : les anciennes lignes
     restaient invisibles dans les compteurs. On harmonise à la lecture. */
  function normaliser(r) {
    const out = Object.assign({}, r);
    if (out.status === 'pending' || !out.status) out.status = 'nouvelle';
    if (!out.createdAt) out.createdAt = out.created_at || out.created || '';
    return out;
  }

  function contenuLocal() {
    return window.MezurContent ? window.MezurContent.getReservations() : [];
  }

  const MezurData = {

    /* true tant que le verdict n'est pas tombé : l'interface n'annonce
       pas « mode local » avant d'avoir essayé. */
    estDistant() {
      return serveurDisponible !== false;
    },

    estPret() {
      return serveurDisponible !== null;
    },

    charger() {
      return appel('GET')
        .then((lignes) => {
          serveurDisponible = true;
          cache = (lignes || []).map(normaliser);
          return cache;
        })
        .catch((e) => {
          if (!e.absente) {
            // Le serveur existe mais refuse : on ne masque pas l'erreur
            // derrière un repli local silencieux.
            serveurDisponible = true;
            throw e;
          }
          serveurDisponible = false;
          cache = contenuLocal();
          return cache;
        });
    },

    tout() {
      return cache;
    },

    ajouter(res) {
      if (local()) {
        const cree = window.MezurContent.addReservation(res);
        cache = contenuLocal();
        return Promise.resolve(cree);
      }
      return appel('POST', { body: res }).then((cree) => {
        const ligne = normaliser(cree || res);
        cache = [ligne].concat(cache);
        return ligne;
      });
    },

    changerStatut(id, statut) {
      if (local()) {
        const liste = contenuLocal();
        const r = liste.find((x) => String(x.id) === String(id));
        if (r) r.status = statut;
        window.MezurContent.saveReservations(liste);
        cache = liste;
        return Promise.resolve();
      }
      return appel('PATCH', {
        query: '?id=' + encodeURIComponent(id),
        body: { status: statut }
      }).then(() => {
        const r = cache.find((x) => String(x.id) === String(id));
        if (r) r.status = statut;
      });
    },

    supprimer(id) {
      if (local()) {
        const liste = contenuLocal().filter((x) => String(x.id) !== String(id));
        window.MezurContent.saveReservations(liste);
        cache = liste;
        return Promise.resolve();
      }
      return appel('DELETE', { query: '?id=' + encodeURIComponent(id) }).then(() => {
        cache = cache.filter((x) => String(x.id) !== String(id));
      });
    }
  };

  window.MezurData = MezurData;

})(window);
