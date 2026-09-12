/* ============================================================
   MEZUR, Accès aux données du back-office

   Deux modes, choisis automatiquement :

   · Supabase configuré  → les réservations viennent du serveur et
     sont visibles depuis n'importe quel appareil. L'accès passe par
     un vrai compte (Authentication → Users dans Supabase).

   · Non configuré       → repli sur le stockage local du navigateur,
     comme avant. Utile pour une démonstration, mais les données ne
     sortent pas de cet appareil : c'est signalé dans l'interface.

   Les lectures se font depuis un cache mémoire, pour que le reste du
   back-office reste synchrone.
   ============================================================ */

'use strict';

(function (window) {

  const SESSION_KEY = 'mezur_admin_session';

  let cache = [];
  let session = null;

  function config() {
    return window.MEZUR_SUPABASE || { url: '', anonKey: '' };
  }

  function distant() {
    const c = config();
    return Boolean(c.url && c.anonKey);
  }

  function lireSession() {
    if (session) return session;
    try {
      session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    } catch (e) {
      session = null;
    }
    return session;
  }

  function ecrireSession(s) {
    session = s;
    try {
      if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (e) { /* navigation privée */ }
  }

  function entetes(json) {
    const c = config();
    const s = lireSession();
    const h = {
      apikey: c.anonKey,
      Authorization: 'Bearer ' + (s && s.access_token ? s.access_token : c.anonKey)
    };
    if (json) h['Content-Type'] = 'application/json';
    return h;
  }

  function rest(chemin, options) {
    const c = config();
    return fetch(c.url + '/rest/v1/' + chemin, options).then((r) => {
      if (r.status === 401 || r.status === 403) {
        throw new Error('Session expirée. Reconnectez-vous.');
      }
      if (!r.ok) throw new Error('Erreur serveur (' + r.status + ')');
      return r.status === 204 ? null : r.json();
    });
  }

  const MezurData = {

    estDistant: distant,

    estConnecte() {
      if (!distant()) return true;
      const s = lireSession();
      return Boolean(s && s.access_token);
    },

    /* ---------- Authentification ---------- */

    connexion(email, motDePasse) {
      if (!distant()) {
        return Promise.reject(new Error('Supabase n\'est pas configuré.'));
      }
      const c = config();
      return fetch(c.url + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { apikey: c.anonKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: motDePasse })
      })
        .then((r) => r.json().then((corps) => ({ ok: r.ok, corps: corps })))
        .then(({ ok, corps }) => {
          if (!ok || !corps.access_token) {
            throw new Error(
              corps.error_description || corps.msg || 'Identifiants incorrects.'
            );
          }
          ecrireSession(corps);
          return corps;
        });
    },

    deconnexion() {
      ecrireSession(null);
      cache = [];
    },

    /* ---------- Réservations ---------- */

    charger() {
      if (!distant()) {
        cache = window.MezurContent ? window.MezurContent.getReservations() : [];
        return Promise.resolve(cache);
      }
      return rest('reservations?select=*&order=date.desc,time.desc', { headers: entetes() })
        .then((lignes) => {
          cache = (lignes || []).map(normaliser);
          return cache;
        });
    },

    tout() {
      return cache;
    },

    ajouter(res) {
      if (!distant()) {
        const cree = window.MezurContent.addReservation(res);
        cache = window.MezurContent.getReservations();
        return Promise.resolve(cree);
      }
      return rest('reservations', {
        method: 'POST',
        headers: Object.assign(entetes(true), { Prefer: 'return=representation' }),
        body: JSON.stringify(res)
      }).then((lignes) => {
        const cree = normaliser((lignes || [])[0] || res);
        cache = [cree].concat(cache);
        return cree;
      });
    },

    changerStatut(id, statut) {
      if (!distant()) {
        const liste = window.MezurContent.getReservations();
        const r = liste.find((x) => String(x.id) === String(id));
        if (r) r.status = statut;
        window.MezurContent.saveReservations(liste);
        cache = liste;
        return Promise.resolve();
      }
      return rest('reservations?id=eq.' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: Object.assign(entetes(true), { Prefer: 'return=minimal' }),
        body: JSON.stringify({ status: statut })
      }).then(() => {
        const r = cache.find((x) => String(x.id) === String(id));
        if (r) r.status = statut;
      });
    },

    supprimer(id) {
      if (!distant()) {
        const liste = window.MezurContent.getReservations()
          .filter((x) => String(x.id) !== String(id));
        window.MezurContent.saveReservations(liste);
        cache = liste;
        return Promise.resolve();
      }
      return rest('reservations?id=eq.' + encodeURIComponent(id), {
        method: 'DELETE',
        headers: Object.assign(entetes(), { Prefer: 'return=minimal' })
      }).then(() => {
        cache = cache.filter((x) => String(x.id) !== String(id));
      });
    },

    /* ---------- Demandes traiteur ---------- */

    chargerTraiteur() {
      if (!distant()) return Promise.resolve([]);
      return rest('traiteur_requests?select=*&order=created_at.desc', { headers: entetes() })
        .then((l) => l || []);
    }
  };

  /* Le site a longtemps écrit « pending » et « created » là où le
     back-office attend « nouvelle » et « createdAt » : les anciennes
     lignes restaient invisibles dans les compteurs. On harmonise à la
     lecture. */
  function normaliser(r) {
    const out = Object.assign({}, r);
    if (out.status === 'pending' || !out.status) out.status = 'nouvelle';
    if (!out.createdAt) out.createdAt = out.created_at || out.created || '';
    return out;
  }

  window.MezurData = MezurData;

})(window);
