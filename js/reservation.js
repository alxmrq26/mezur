/* ============================================================
   MEZUR, Réservation

   Une seule vue : couverts, jour, service, heure, coordonnées.
   La demande part vers Supabase. Si la connexion n'est pas
   configurée ou si le réseau tombe, on ne prétend jamais que la
   demande est passée : on propose l'appel et le courriel.
   ============================================================ */

'use strict';

(function () {

  /* ---------- Constantes ---------- */

  // Créneaux par service, dérivés des horaires d'ouverture.
  const CRENEAUX = {
    midi: ['12:00', '12:30', '13:00', '13:30', '14:00'],
    soir: ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30']
  };

  // On n'accepte plus de réservation à moins d'une demi-heure du service.
  const PREAVIS_MIN = 30;
  // Horizon de réservation.
  const HORIZON_JOURS = 90;
  const TEL_RESTAURANT = '04 75 41 22 86';
  const EMAIL_RESTAURANT = 'mezurvalence@gmail.com';

  const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  /* ---------- État ---------- */

  const etat = {
    couverts: 2,
    date: '',
    service: 'midi',
    heure: '',
    occasion: '',
    complets: {}   // { '19:30': couverts restants }
  };

  /* ---------- Raccourcis ---------- */

  const $ = (sel) => document.querySelector(sel);
  const form = $('#reserver');
  if (!form) return;

  const elDate = $('#resa-date');
  const elCreneaux = $('#creneaux-grille');
  const elCreneauxAide = $('#creneaux-aide');
  const elRecapFort = $('#resa-recap strong');
  const elRecapDetail = $('#resa-recap-detail');
  const elAlerte = $('#resa-alerte');
  const elEnvoyer = $('#resa-envoyer');
  const elSucces = $('#resa-succes');

  /* ---------- Dates ---------- */

  function iso(d) {
    // Date locale : toISOString() décalerait d'un jour selon le fuseau.
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const j = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${j}`;
  }

  function depuisIso(s) {
    const [a, m, j] = s.split('-').map(Number);
    return new Date(a, m - 1, j);
  }

  function estFerme(dateIso) {
    const jour = depuisIso(dateIso).getDay();
    const contenu = window.MezurContent ? window.MezurContent.get() : null;
    if (!contenu || !contenu.hours) return jour === 0;
    // hours[] commence au lundi, getDay() au dimanche.
    const index = jour === 0 ? 6 : jour - 1;
    const h = contenu.hours[index];
    return h ? !!h.ferme : jour === 0;
  }

  function libelleDate(dateIso) {
    const d = depuisIso(dateIso);
    return `${JOURS[d.getDay()]} ${d.getDate()}`;
  }

  /* ---------- Raccourcis de date ---------- */

  function construireDatesRapides() {
    const conteneur = $('#dates-rapides');
    if (!conteneur) return;

    const aujourdhui = new Date();
    const propositions = [];

    for (let i = 0; propositions.length < 4 && i < 14; i++) {
      const d = new Date(aujourdhui);
      d.setDate(aujourdhui.getDate() + i);
      const valeur = iso(d);
      if (estFerme(valeur)) continue;
      let libelle;
      if (i === 0) libelle = "Aujourd'hui";
      else if (i === 1) libelle = 'Demain';
      else libelle = libelleDate(valeur);
      propositions.push({ valeur, libelle });
    }

    conteneur.innerHTML = propositions.map((p) => (
      `<button type="button" class="choix" data-date="${p.valeur}" aria-pressed="false">${p.libelle}</button>`
    )).join('');

    conteneur.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-date]');
      if (!btn) return;
      choisirDate(btn.dataset.date);
    });

    // Bornes du sélecteur natif.
    elDate.min = iso(aujourdhui);
    const max = new Date(aujourdhui);
    max.setDate(max.getDate() + HORIZON_JOURS);
    elDate.max = iso(max);

    if (propositions.length) choisirDate(propositions[0].valeur);
  }

  function choisirDate(valeur) {
    if (!valeur) return;

    if (estFerme(valeur)) {
      montrerErreur('erreur-date', elDate, `Le restaurant est fermé le ${JOURS[depuisIso(valeur).getDay()].toLowerCase()}. Choisissez un autre jour.`);
      return;
    }
    effacerErreur('erreur-date', elDate);

    etat.date = valeur;
    elDate.value = valeur;

    document.querySelectorAll('#dates-rapides [data-date]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.date === valeur));
    });

    // Le soir est proposé d'office si le déjeuner est déjà passé.
    if (valeur === iso(new Date()) && new Date().getHours() >= 14) {
      choisirService('soir', true);
    }

    chargerDisponibilites().then(rendreCreneaux);
    majRecap();
  }

  /* ---------- Service ---------- */

  function choisirService(service, silencieux) {
    etat.service = service;
    document.querySelectorAll('#service-grille [data-service]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.service === service));
    });
    if (!silencieux) {
      etat.heure = '';
    }
    rendreCreneaux();
    majRecap();
  }

  /* ---------- Créneaux ---------- */

  function minutes(hhmm) {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  }

  function creneauPasse(heure) {
    if (etat.date !== iso(new Date())) return false;
    const maintenant = new Date();
    return minutes(heure) <= maintenant.getHours() * 60 + maintenant.getMinutes() + PREAVIS_MIN;
  }

  function rendreCreneaux() {
    const liste = CRENEAUX[etat.service] || [];
    let disponibles = 0;

    elCreneaux.innerHTML = liste.map((heure) => {
      const passe = creneauPasse(heure);
      const restant = etat.complets[heure];
      const complet = typeof restant === 'number' && restant < etat.couverts;
      const indispo = passe || complet;
      if (!indispo) disponibles++;

      // Le motif est écrit dans le libellé accessible : l'information
      // ne repose pas seulement sur le barré ni sur la couleur.
      const motif = passe ? ' (trop tard)' : (complet ? ' (complet)' : '');
      return (
        `<button type="button" class="choix" data-heure="${heure}"` +
        ` aria-pressed="${String(etat.heure === heure)}"` +
        `${indispo ? ' disabled' : ''}` +
        ` aria-label="${heure.replace(':', 'h')}${motif}">${heure.replace(':', 'h')}</button>`
      );
    }).join('');

    if (!disponibles) {
      elCreneauxAide.textContent = etat.service === 'midi'
        ? "Plus de table au déjeuner ce jour-là. Essayez le dîner ou un autre jour."
        : "Plus de table au dîner ce jour-là. Essayez un autre jour ou appelez-nous.";
    } else {
      elCreneauxAide.textContent = '';
    }

    // Une heure devenue indisponible ne reste pas sélectionnée.
    if (etat.heure && !liste.includes(etat.heure)) etat.heure = '';
    const actif = elCreneaux.querySelector(`[data-heure="${etat.heure}"]`);
    if (actif && actif.disabled) {
      etat.heure = '';
      majRecap();
    }
  }

  /* ---------- Disponibilités ---------- */

  function chargerDisponibilites() {
    etat.complets = {};
    if (!window.MEZUR_SUPABASE_READY || !window.MEZUR_SUPABASE_READY()) {
      return Promise.resolve();
    }

    const c = window.MEZUR_SUPABASE;
    return fetch(`${c.url}/rest/v1/rpc/get_availability`, {
      method: 'POST',
      headers: {
        apikey: c.anonKey,
        Authorization: 'Bearer ' + c.anonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jour: etat.date })
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((lignes) => {
        (lignes || []).forEach((l) => {
          if (l && l.time) etat.complets[String(l.time).slice(0, 5)] = l.restant;
        });
      })
      .catch(() => { /* la disponibilité est un confort, pas un bloquant */ });
  }

  /* ---------- Récapitulatif ---------- */

  function majRecap() {
    elRecapFort.textContent = etat.couverts === 1
      ? '1 personne'
      : (etat.couverts >= 7 ? '7 personnes et plus' : etat.couverts + ' personnes');

    if (etat.date && etat.heure) {
      elRecapDetail.textContent = `${libelleDate(etat.date)} · ${etat.heure.replace(':', 'h')}`;
    } else if (etat.date) {
      elRecapDetail.textContent = `${libelleDate(etat.date)} · choisissez une heure`;
    } else {
      elRecapDetail.textContent = 'Choisissez une date';
    }
  }

  /* ---------- Validation ---------- */

  function montrerErreur(idErreur, champ, message) {
    const el = document.getElementById(idErreur);
    if (el) {
      el.textContent = message;
      el.classList.add('visible');
    }
    if (champ) champ.setAttribute('aria-invalid', 'true');
  }

  function effacerErreur(idErreur, champ) {
    const el = document.getElementById(idErreur);
    if (el) {
      el.textContent = '';
      el.classList.remove('visible');
    }
    if (champ) champ.removeAttribute('aria-invalid');
  }

  function telValide(v) {
    const chiffres = v.replace(/[^0-9]/g, '');
    return chiffres.length >= 9 && chiffres.length <= 15;
  }

  function emailValide(v) {
    return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  }

  function valider() {
    const nom = $('#resa-nom');
    const tel = $('#resa-tel');
    const email = $('#resa-email');
    let premierEnDefaut = null;

    if (!etat.date) {
      montrerErreur('erreur-date', elDate, 'Choisissez le jour de votre venue.');
      premierEnDefaut = premierEnDefaut || elDate;
    } else {
      effacerErreur('erreur-date', elDate);
    }

    if (!etat.heure) {
      montrerErreur('erreur-heure', null, 'Choisissez une heure d\'arrivée.');
      premierEnDefaut = premierEnDefaut || elCreneaux.querySelector('.choix:not(:disabled)');
    } else {
      effacerErreur('erreur-heure', null);
    }

    if (!nom.value.trim()) {
      montrerErreur('erreur-nom', nom, 'Indiquez le nom de la réservation.');
      premierEnDefaut = premierEnDefaut || nom;
    } else {
      effacerErreur('erreur-nom', nom);
    }

    if (!tel.value.trim()) {
      montrerErreur('erreur-tel', tel, 'Le téléphone est nécessaire : c\'est par là que nous confirmons.');
      premierEnDefaut = premierEnDefaut || tel;
    } else if (!telValide(tel.value)) {
      montrerErreur('erreur-tel', tel, 'Ce numéro semble incomplet. Exemple : 06 12 34 56 78.');
      premierEnDefaut = premierEnDefaut || tel;
    } else {
      effacerErreur('erreur-tel', tel);
    }

    if (!emailValide(email.value.trim())) {
      montrerErreur('erreur-email', email, 'Cette adresse email semble incorrecte.');
      premierEnDefaut = premierEnDefaut || email;
    } else {
      effacerErreur('erreur-email', email);
    }

    if (premierEnDefaut) {
      premierEnDefaut.focus();
      premierEnDefaut.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return false;
    }
    return true;
  }

  /* ---------- Envoi ---------- */

  function donnees() {
    return {
      date: etat.date,
      service: etat.service,
      time: etat.heure,
      covers: etat.couverts,
      occasion: etat.occasion || null,
      nom: $('#resa-nom').value.trim(),
      prenom: $('#resa-prenom').value.trim() || null,
      telephone: $('#resa-tel').value.trim(),
      email: $('#resa-email').value.trim() || null,
      message: $('#resa-message').value.trim() || null,
      status: 'nouvelle'
    };
  }

  function envoyerVersSupabase(payload, table) {
    const c = window.MEZUR_SUPABASE;
    return fetch(`${c.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: c.anonKey,
        Authorization: 'Bearer ' + c.anonKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    }).then((r) => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return true;
    });
  }

  function texteDemande(d) {
    return [
      'Bonjour,',
      '',
      `Je souhaite réserver une table pour ${d.covers} personne(s)`,
      `le ${libelleDate(d.date)} à ${d.time.replace(':', 'h')} (${d.service}).`,
      '',
      `Nom : ${d.prenom ? d.prenom + ' ' : ''}${d.nom}`,
      `Téléphone : ${d.telephone}`,
      d.occasion ? `Occasion : ${d.occasion}` : '',
      d.message ? `Précisions : ${d.message}` : '',
      '',
      'Merci de me confirmer.'
    ].filter(Boolean).join('\n');
  }

  // Aucune confirmation n'est affichée si la demande n'est pas partie :
  // on donne à la place deux moyens qui, eux, fonctionnent.
  function afficherRepli(d) {
    const corps = encodeURIComponent(texteDemande(d));
    const sujet = encodeURIComponent(`Réservation ${libelleDate(d.date)} à ${d.time.replace(':', 'h')} · ${d.covers} pers.`);
    elAlerte.innerHTML =
      "Nous n'avons pas pu enregistrer votre demande en ligne. " +
      'Votre table n\'est donc pas retenue. Deux solutions&nbsp;: ' +
      `<a href="tel:+33475412286">appeler le ${TEL_RESTAURANT}</a> ` +
      `ou <a href="mailto:${EMAIL_RESTAURANT}?subject=${sujet}&body=${corps}">envoyer votre demande par email</a> ` +
      '(le message est déjà rédigé).';
    elAlerte.classList.add('visible');
    elAlerte.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function fichierIcs(d) {
    const debut = d.date.replace(/-/g, '') + 'T' + d.time.replace(':', '') + '00';
    const finH = String(Number(d.time.split(':')[0]) + 2).padStart(2, '0');
    const fin = d.date.replace(/-/g, '') + 'T' + finH + d.time.split(':')[1] + '00';
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MEZUR//Reservation//FR',
      'BEGIN:VEVENT',
      'SUMMARY:Table chez MEZUR',
      `DTSTART:${debut}`,
      `DTEND:${fin}`,
      'LOCATION:4 Rue de l\'Université\\, 26000 Valence',
      `DESCRIPTION:Réservation pour ${d.covers} personne(s). Tél. ${TEL_RESTAURANT}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
  }

  function afficherSucces(d, enregistre) {
    const recap = $('#resa-succes-recap');
    const lignes = [
      ['Quand', `${libelleDate(d.date)} à ${d.time.replace(':', 'h')}`],
      ['Couverts', d.covers === 1 ? '1 personne' : d.covers + ' personnes'],
      ['Au nom de', `${d.prenom ? d.prenom + ' ' : ''}${d.nom}`],
      ['Téléphone', d.telephone]
    ];
    if (d.occasion) lignes.push(['Occasion', d.occasion]);

    recap.innerHTML = lignes.map(([cle, valeur]) => (
      `<li><span class="recap-cle">${cle}</span><span class="recap-valeur">${valeur}</span></li>`
    )).join('');

    if (!enregistre) {
      $('#resa-succes-texte').textContent =
        `Demande transmise. Appelez-nous au ${TEL_RESTAURANT} si vous n'avez pas de retour d'ici deux heures.`;
    }

    const ics = $('#resa-ics');
    if (ics) ics.setAttribute('href', fichierIcs(d));

    form.style.display = 'none';
    elSucces.classList.add('visible');
    // Le focus suit la confirmation, sinon il resterait sur un bouton masqué.
    elSucces.focus();
    elSucces.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  /* ---------- Écouteurs ---------- */

  function brancherGroupe(selecteur, attribut, onChoix, multiple) {
    const conteneur = document.querySelector(selecteur);
    if (!conteneur) return;
    conteneur.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-' + attribut + ']');
      if (!btn || btn.disabled) return;

      if (multiple) {
        btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      } else {
        conteneur.querySelectorAll('[data-' + attribut + ']').forEach((b) => {
          b.setAttribute('aria-pressed', String(b === btn));
        });
      }
      onChoix(btn.dataset[attribut], btn);
    });
  }

  brancherGroupe('#couverts-grille', 'couverts', (v) => {
    etat.couverts = Number(v);
    rendreCreneaux();
    majRecap();
  });

  brancherGroupe('#service-grille', 'service', (v) => choisirService(v));

  brancherGroupe('#creneaux-grille', 'heure', (v) => {
    etat.heure = v;
    effacerErreur('erreur-heure', null);
    majRecap();
  });

  brancherGroupe('#occasion-grille', 'occasion', (v, btn) => {
    // Un second appui annule le choix.
    etat.occasion = btn.getAttribute('aria-pressed') === 'true' ? v : '';
  });

  elDate.addEventListener('change', () => choisirDate(elDate.value));

  // Validation à la sortie du champ, pas à chaque frappe.
  $('#resa-nom').addEventListener('blur', function () {
    if (this.value.trim()) effacerErreur('erreur-nom', this);
  });
  $('#resa-tel').addEventListener('blur', function () {
    if (this.value.trim() && telValide(this.value)) effacerErreur('erreur-tel', this);
    else if (this.value.trim()) montrerErreur('erreur-tel', this, 'Ce numéro semble incomplet. Exemple : 06 12 34 56 78.');
  });
  $('#resa-email').addEventListener('blur', function () {
    if (emailValide(this.value.trim())) effacerErreur('erreur-email', this);
    else montrerErreur('erreur-email', this, 'Cette adresse email semble incorrecte.');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    elAlerte.classList.remove('visible');
    if (!valider()) return;

    const d = donnees();

    if (!window.MEZUR_SUPABASE_READY || !window.MEZUR_SUPABASE_READY()) {
      afficherRepli(d);
      return;
    }

    // Le bouton est verrouillé le temps de l'envoi : pas de double demande.
    elEnvoyer.disabled = true;
    elEnvoyer.dataset.chargement = 'true';
    const libelle = elEnvoyer.textContent;
    elEnvoyer.textContent = 'Envoi…';

    envoyerVersSupabase(d, 'reservations')
      .then(() => afficherSucces(d, true))
      .catch(() => afficherRepli(d))
      .then(() => {
        elEnvoyer.disabled = false;
        delete elEnvoyer.dataset.chargement;
        elEnvoyer.textContent = libelle;
      });
  });

  /* ---------- Traiteur ---------- */

  const traiteur = $('#traiteur-form');
  if (traiteur) {
    brancherGroupe('#traiteur-types', 'type', () => {}, true);

    traiteur.addEventListener('submit', function (e) {
      e.preventDefault();
      const alerte = $('#traiteur-alerte');
      alerte.classList.remove('visible');

      const nom = $('#t-nom');
      const tel = $('#t-tel');
      let defaut = null;

      if (!nom.value.trim()) {
        montrerErreur('erreur-t-nom', nom, 'Indiquez votre nom.');
        defaut = defaut || nom;
      } else { effacerErreur('erreur-t-nom', nom); }

      if (!tel.value.trim() || !telValide(tel.value)) {
        montrerErreur('erreur-t-tel', tel, 'Un numéro joignable est nécessaire pour vous rappeler.');
        defaut = defaut || tel;
      } else { effacerErreur('erreur-t-tel', tel); }

      if (defaut) { defaut.focus(); return; }

      const types = Array.prototype.slice
        .call(document.querySelectorAll('#traiteur-types [aria-pressed="true"]'))
        .map((b) => b.dataset.type).join(', ');

      const payload = {
        types: types || null,
        nom: nom.value.trim(),
        telephone: tel.value.trim(),
        email: $('#t-email').value.trim() || null,
        date: $('#t-date').value || null,
        guests: $('#t-guests').value ? Number($('#t-guests').value) : null,
        message: $('#t-message').value.trim() || null
      };

      function replliTraiteur() {
        const corps = encodeURIComponent(
          `Bonjour,\n\nDemande ${types || 'de privatisation'}.\n` +
          `Nom : ${payload.nom}\nTéléphone : ${payload.telephone}\n` +
          (payload.date ? `Date envisagée : ${payload.date}\n` : '') +
          (payload.guests ? `Personnes : ${payload.guests}\n` : '') +
          (payload.message ? `\n${payload.message}\n` : '')
        );
        alerte.innerHTML =
          "Nous n'avons pas pu transmettre votre demande. " +
          `<a href="tel:+33475412286">Appelez le ${TEL_RESTAURANT}</a> ou ` +
          `<a href="mailto:${EMAIL_RESTAURANT}?subject=Demande%20traiteur&body=${corps}">envoyez-la par email</a>.`;
        alerte.classList.add('visible');
      }

      if (!window.MEZUR_SUPABASE_READY || !window.MEZUR_SUPABASE_READY()) {
        replliTraiteur();
        return;
      }

      const bouton = $('#traiteur-envoyer');
      bouton.disabled = true;
      bouton.textContent = 'Envoi…';

      envoyerVersSupabase(payload, 'traiteur_requests')
        .then(() => {
          traiteur.style.display = 'none';
          const ok = $('#traiteur-succes');
          ok.classList.add('visible');
          ok.focus();
        })
        .catch(replliTraiteur)
        .then(() => {
          bouton.disabled = false;
          bouton.textContent = 'Envoyer';
        });
    });
  }

  /* ---------- Démarrage ---------- */

  function demarrer() {
    // Le service par défaut suit l'heure qu'il est.
    if (new Date().getHours() >= 14) choisirService('soir', true);
    construireDatesRapides();
    rendreCreneaux();
    majRecap();

    // Les créneaux du jour même se périment pendant la consultation.
    window.setInterval(() => {
      if (etat.date === iso(new Date())) rendreCreneaux();
    }, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrer);
  } else {
    demarrer();
  }
})();
