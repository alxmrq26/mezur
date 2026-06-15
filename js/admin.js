/* ============================================================
   MEZUR — Back Office  v6
   Front-only : s'appuie sur MezurContent (js/content.js).
   ============================================================ */
'use strict';

(function () {
  const PW_KEY      = 'mezur_admin_pw';
  const SESSION_KEY = 'mezur_admin_auth';
  const DEFAULT_PW  = 'mezur2026';

  let state = null;
  let dirty = false;

  /* ---------- Labels ---------- */
  const IMAGE_LABELS = {
    maisonAccueil:   'Accueil — section « La Maison »',
    pierrePortrait:  'Portrait Pierre (chef)',
    thomasPortrait:  'Portrait Thomas (sommelier)',
    aproposHero:     'Bannière — page La Maison',
    menuHero:        'Bannière — page Menu',
    platSignature1:  'Plat signature 1 (accueil)',
    platSignature2:  'Plat signature 2 (accueil)',
    ctaFond:         'Fond — bloc « Votre table vous attend »',
    reservationFond: 'Fond — bannière Réservations'
  };
  const TEXT_LABELS = {
    heroTagline:    'Accroche du hero (accueil)',
    manifesteIntro: 'Introduction manifeste (accueil)',
    maisonQuote:    'Citation « La Maison » (accueil)',
    maisonText1:    'La Maison — paragraphe 1',
    maisonText2:    'La Maison — paragraphe 2',
    aproposIntro:   'Introduction — page La Maison'
  };
  const MENU_LABELS = {
    formules:  'Formules & Menus',
    entrees:   'Entrées',
    plats:     'Plats',
    desserts:  'Desserts',
    vins:      'Vins'
  };
  const STATUS_LABELS = {
    nouvelle:  'Nouvelle',
    confirmee: 'Confirmée',
    annulee:   'Annulée',
    'no-show': 'No-show'
  };
  /* En-têtes CSV en français */
  const CSV_HEADERS = {
    date:      'Date',
    time:      'Heure',
    covers:    'Couverts',
    prenom:    'Prénom',
    nom:       'Nom',
    telephone: 'Téléphone',
    email:     'Email',
    occasion:  'Occasion',
    message:   'Message',
    status:    'Statut',
    createdAt: 'Créé le'
  };

  /* ---------- Helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function markDirty() {
    dirty = true;
    $('#dirty-flag').hidden = false;
  }
  function clearDirty() {
    dirty = false;
    $('#dirty-flag').hidden = true;
  }

  let toastTimer;
  function toast(msg, type) {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show' + (type ? ' ' + type : '');
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = 'toast'; }, 2600);
  }

  /* ---------- Stockage sécurisé ---------- */
  function lsGet(k)  { try { return localStorage.getItem(k); }      catch (e) { return null; } }
  function lsSet(k,v){ try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function lsDel(k)  { try { localStorage.removeItem(k); }           catch (e) {} }
  function ssSet(k,v){ try { sessionStorage.setItem(k, v); }         catch (e) {} }
  function ssGet(k)  { try { return sessionStorage.getItem(k); }     catch (e) { return null; } }
  function ssDel(k)  { try { sessionStorage.removeItem(k); }         catch (e) {} }

  /* ============ AUTH ============ */
  function storedPw() {
    const v = lsGet(PW_KEY);
    if (!v) return DEFAULT_PW;
    try { return atob(v); } catch (e) { return DEFAULT_PW; }
  }
  function setPw(pw) {
    try { lsSet(PW_KEY, btoa(unescape(encodeURIComponent(pw)))); }
    catch (e) { lsSet(PW_KEY, btoa(pw)); }
  }

  function openApp() {
    $('#login-screen').hidden = true;
    $('#app').hidden = false;
    boot();
  }

  function doLogin() {
    try {
      const pw = ($('#login-pw').value || '').trim();
      if (pw === storedPw()) {
        ssSet(SESSION_KEY, '1');
        openApp();
      } else {
        $('#login-error').textContent = 'Mot de passe incorrect.';
      }
    } catch (err) {
      const el = $('#login-error');
      if (el) el.textContent = 'Erreur : ' + (err && err.message ? err.message : err);
    }
  }

  $('#login-form').addEventListener('submit', (e) => { e.preventDefault(); doLogin(); });
  const loginBtn = $('#login-form button[type="submit"]');
  if (loginBtn) loginBtn.addEventListener('click', (e) => { e.preventDefault(); doLogin(); });

  const resetLink = $('#login-reset');
  if (resetLink) resetLink.addEventListener('click', (e) => {
    e.preventDefault();
    lsDel(PW_KEY);
    $('#login-error').textContent = '';
    const pwInput = $('#login-pw');
    pwInput.value = DEFAULT_PW;
    pwInput.focus();
    $('#login-reset-done').hidden = false;
  });

  $('#btn-logout').addEventListener('click', () => {
    if (dirty && !confirm('Des modifications ne sont pas publiées. Se déconnecter quand même ?')) return;
    ssDel(SESSION_KEY);
    location.reload();
  });

  /* ============ NAVIGATION ============ */
  function setSidebarOpen(open) {
    $('#sidebar').classList.toggle('open', open);
    const overlay = $('#sidebar-overlay');
    if (overlay) overlay.classList.toggle('visible', open);
  }

  function showView(name) {
    $$('.nav-link').forEach((b) => b.classList.toggle('is-active', b.dataset.view === name));
    $$('.view').forEach((v) => { v.hidden = v.dataset.view !== name; });
    setSidebarOpen(false);
    if (name === 'dashboard')    renderDashboard();
    if (name === 'reservations') renderReservations();
  }
  $$('.nav-link').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));
  $('#burger').addEventListener('click', () => setSidebarOpen(!$('#sidebar').classList.contains('open')));
  const overlay = $('#sidebar-overlay');
  if (overlay) overlay.addEventListener('click', () => setSidebarOpen(false));

  /* ============ PUBLISH ============ */
  $('#btn-publish').addEventListener('click', () => {
    MezurContent.save(state);
    clearDirty();
    toast('Contenu publié', 'ok');
  });

  /* ============ BOOT ============ */
  function boot() {
    state = MezurContent.get();
    /* Garantit que toutes les sections du menu existent dans state */
    if (!state.menu) state.menu = {};
    Object.keys(MENU_LABELS).forEach((k) => { if (!Array.isArray(state.menu[k])) state.menu[k] = []; });

    renderDashboard();
    renderMenuEditor();
    renderImagesEditor();
    renderTextsEditor();
    renderHoursEditor();
    renderContactEditor();
    bindSettings();
    updateResBadge();
    bindNewResModal();
    refreshIcons();
  }

  /* ============ DASHBOARD ============ */
  function todayISO() { return new Date().toISOString().slice(0, 10); }

  function renderDashboard() {
    const res   = MezurContent.getReservations();
    const today = todayISO();
    const in7   = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
    const active     = res.filter((r) => r.status !== 'annulee');
    const todayCount = active.filter((r) => r.date === today).length;
    const upcoming   = active.filter((r) => r.date >= today && r.date <= in7).length;
    const nouvelles  = res.filter((r) => r.status === 'nouvelle').length;

    const statsData = [
      { label: "Aujourd'hui",      num: todayCount, date: 'today',  status: 'all' },
      { label: '7 prochains jours', num: upcoming,   date: '',       status: 'all' },
      { label: 'À traiter',         num: nouvelles,  date: '',       status: 'nouvelle' },
      { label: 'Total',             num: res.length,  date: '',       status: 'all' }
    ];

    $('#stats-grid').innerHTML = statsData.map(({ label, num, date, status }) => `
      <div class="stat-card" data-date="${esc(date)}" data-status="${esc(status)}" role="button" tabindex="0" aria-label="${esc(label)} : ${num}">
        <div class="stat-num">${num}</div>
        <span class="stat-label">${esc(label)}</span>
        <span class="stat-arrow"><i data-lucide="arrow-right"></i></span>
      </div>`).join('');

    $$('.stat-card', $('#stats-grid')).forEach((card) => {
      const go = () => {
        if (card.dataset.date === 'today') $('#res-date-filter').value = today;
        else $('#res-date-filter').value = '';
        $('#res-filter').value = card.dataset.status || 'all';
        $('#res-search').value = '';
        showView('reservations');
      };
      card.addEventListener('click', go);
      card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') go(); });
    });

    const next = active
      .filter((r) => r.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
      .slice(0, 5);
    $('#dashboard-upcoming').innerHTML = next.length
      ? next.map(resCardHTML).join('')
      : '<div class="empty-state">Aucune réservation à venir.</div>';
    bindResCards($('#dashboard-upcoming'));
    refreshIcons();
  }

  function updateResBadge() {
    const n = MezurContent.getReservations().filter((r) => r.status === 'nouvelle').length;
    $('#nav-res-badge').textContent = n ? n : '';
  }

  /* ============ RÉSERVATIONS ============ */
  function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function statusSelectHTML(current) {
    return Object.keys(STATUS_LABELS).map((v) =>
      `<option value="${v}"${current === v ? ' selected' : ''}>${STATUS_LABELS[v]}</option>`
    ).join('');
  }

  function resCardHTML(r) {
    const status = r.status || 'nouvelle';
    const nom = [r.prenom, r.nom].filter(Boolean).join(' ') || 'Sans nom';
    const tel  = r.telephone ? `<a href="tel:${esc(r.telephone)}">${esc(r.telephone)}</a>` : '';
    const mail = r.email     ? `<a href="mailto:${esc(r.email)}">${esc(r.email)}</a>` : '';
    const occ  = r.occasion  ? ` · ${esc(r.occasion)}` : '';
    return `
      <div class="res-card status-${esc(status)}" data-id="${esc(r.id)}">
        <div>
          <div class="res-when">${esc(fmtDate(r.date))} <em>· ${esc(r.time || '—')}</em></div>
          <div class="res-who">${esc(nom)} — ${esc(r.covers || '?')} couvert(s)${occ}</div>
          <div class="res-meta">${[tel, mail].filter(Boolean).join(' · ')}</div>
          ${r.message ? `<div class="res-msg"><i data-lucide="message-square"></i>${esc(r.message)}</div>` : ''}
        </div>
        <div class="res-actions">
          <span class="badge ${esc(status)}">${STATUS_LABELS[status] || status}</span>
          <select class="res-status" aria-label="Statut">${statusSelectHTML(status)}</select>
          <button class="icon-btn del res-del" title="Supprimer"><i data-lucide="trash-2"></i></button>
        </div>
      </div>`;
  }

  function renderReservations() {
    const q      = ($('#res-search').value || '').toLowerCase().trim();
    const filter = $('#res-filter').value;
    const date   = ($('#res-date-filter') && $('#res-date-filter').value) || '';
    let list = MezurContent.getReservations()
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    if (filter !== 'all') list = list.filter((r) => (r.status || 'nouvelle') === filter);
    if (date)  list = list.filter((r) => r.date === date);
    if (q)     list = list.filter((r) => [r.nom, r.prenom, r.telephone, r.email].join(' ').toLowerCase().includes(q));

    $('#reservations-list').innerHTML = list.length
      ? list.map(resCardHTML).join('')
      : '<div class="empty-state">Aucune réservation ne correspond.</div>';
    bindResCards($('#reservations-list'));
    refreshIcons();
  }

  function bindResCards(container) {
    $$('.res-card', container).forEach((card) => {
      const id = card.dataset.id;
      const sel = $('.res-status', card);
      if (sel) sel.addEventListener('change', () => {
        const list = MezurContent.getReservations();
        const r = list.find((x) => x.id === id);
        if (r) { r.status = sel.value; MezurContent.saveReservations(list); }
        renderReservations(); renderDashboard(); updateResBadge();
      });
      const del = $('.res-del', card);
      if (del) del.addEventListener('click', () => {
        if (!confirm('Supprimer cette réservation définitivement ?')) return;
        MezurContent.saveReservations(MezurContent.getReservations().filter((x) => x.id !== id));
        renderReservations(); renderDashboard(); updateResBadge();
        toast('Réservation supprimée');
      });
    });
  }

  $('#res-search').addEventListener('input', renderReservations);
  $('#res-filter').addEventListener('change', renderReservations);
  const resDateFilter = $('#res-date-filter');
  if (resDateFilter) resDateFilter.addEventListener('change', renderReservations);

  $('#btn-export-csv').addEventListener('click', () => {
    const list = MezurContent.getReservations();
    if (!list.length) { toast('Aucune réservation à exporter', 'err'); return; }
    const cols = Object.keys(CSV_HEADERS);
    const header = Object.values(CSV_HEADERS).join(';');
    const csv = [header].concat(
      list.map((r) => cols.map((c) => `"${String(r[c] == null ? '' : r[c]).replace(/"/g, '""')}"`).join(';'))
    ).join('\n');
    download('reservations-mezur.csv', 'text/csv;charset=utf-8', '﻿' + csv);
  });

  /* ============ MODAL NOUVELLE RÉSERVATION ============ */
  function bindNewResModal() {
    const modal  = $('#modal-new-res');
    const form   = $('#form-new-res');
    const btnNew = $('#btn-new-res');

    function openModal() {
      /* Pré-remplir la date avec aujourd'hui */
      const nr = $('#nr-date');
      if (nr && !nr.value) nr.value = todayISO();
      modal.hidden = false;
      refreshIcons();
      setTimeout(() => { const f = $('#nr-prenom'); if (f) f.focus(); }, 50);
    }
    function closeModal() { modal.hidden = true; form.reset(); }

    if (btnNew)             btnNew.addEventListener('click', openModal);
    if ($('#modal-close'))  $('#modal-close').addEventListener('click', closeModal);
    if ($('#modal-cancel')) $('#modal-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      const prenom = ($('#nr-prenom').value || '').trim();
      const date   = ($('#nr-date').value   || '').trim();
      const time   = ($('#nr-time').value   || '').trim();
      const covers = +$('#nr-covers').value || 0;
      if (!prenom || !date || !time || covers < 1) {
        toast('Remplissez les champs obligatoires (date, heure, couverts, prénom)', 'err');
        return;
      }
      const newRes = {
        date,
        time,
        covers,
        prenom,
        nom:       ($('#nr-nom').value    || '').trim(),
        telephone: ($('#nr-tel').value    || '').trim(),
        email:     ($('#nr-email').value  || '').trim(),
        occasion:  ($('#nr-occasion').value || '').trim(),
        message:   ($('#nr-message').value  || '').trim(),
        status:    $('#nr-status').value || 'confirmee'
      };
      MezurContent.addReservation(newRes);
      closeModal();
      renderReservations(); renderDashboard(); updateResBadge();
      toast('Réservation créée', 'ok');
    });
  }

  /* ============ MENU EDITOR ============ */
  function renderMenuEditor() {
    const ed = $('#menu-editor');
    ed.innerHTML = Object.keys(MENU_LABELS).map((sec) => `
      <div class="menu-group" data-sec="${sec}">
        <div class="menu-group-head">
          <h2>${esc(MENU_LABELS[sec])}</h2>
          <button class="btn btn-gold btn-sm add-item" data-sec="${sec}">
            <i data-lucide="plus"></i> Ajouter
          </button>
        </div>
        <div class="menu-rows"></div>
      </div>`).join('');

    Object.keys(MENU_LABELS).forEach(renderMenuRows);

    $$('.add-item', ed).forEach((b) => b.addEventListener('click', () => {
      if (!Array.isArray(state.menu[b.dataset.sec])) state.menu[b.dataset.sec] = [];
      state.menu[b.dataset.sec].push({ nom: 'Nouveau', desc: '', prix: '' });
      markDirty(); renderMenuRows(b.dataset.sec);
    }));
    refreshIcons();
  }

  function renderMenuRows(sec) {
    const wrap  = $(`.menu-group[data-sec="${sec}"] .menu-rows`);
    if (!wrap) return;
    const items = state.menu[sec] || [];
    wrap.innerHTML = items.map((it, i) => `
      <div class="menu-row" data-i="${i}">
        <input class="f-nom"  value="${esc(it.nom)}"  placeholder="Nom du plat">
        <textarea class="f-desc" placeholder="Description">${esc(it.desc)}</textarea>
        <input class="f-prix" value="${esc(it.prix)}" placeholder="Prix (ex : 19 €)">
        <div class="row-tools">
          <button class="icon-btn up"  title="Monter"><i data-lucide="chevron-up"></i></button>
          <button class="icon-btn down" title="Descendre"><i data-lucide="chevron-down"></i></button>
          <button class="icon-btn del" title="Supprimer"><i data-lucide="trash-2"></i></button>
        </div>
      </div>`).join('');

    $$('.menu-row', wrap).forEach((row) => {
      const i = +row.dataset.i;
      $('.f-nom',  row).addEventListener('input', (e) => { items[i].nom  = e.target.value; markDirty(); });
      $('.f-desc', row).addEventListener('input', (e) => { items[i].desc = e.target.value; markDirty(); });
      $('.f-prix', row).addEventListener('input', (e) => { items[i].prix = e.target.value; markDirty(); });
      $('.del',  row).addEventListener('click', () => { items.splice(i, 1); markDirty(); renderMenuRows(sec); });
      $('.up',   row).addEventListener('click', () => {
        if (i > 0) { [items[i-1], items[i]] = [items[i], items[i-1]]; markDirty(); renderMenuRows(sec); }
      });
      $('.down', row).addEventListener('click', () => {
        if (i < items.length-1) { [items[i+1], items[i]] = [items[i], items[i+1]]; markDirty(); renderMenuRows(sec); }
      });
    });
    refreshIcons();
  }

  /* ============ IMAGES EDITOR ============ */
  function renderImagesEditor() {
    const ed = $('#images-editor');
    ed.innerHTML = Object.keys(IMAGE_LABELS).map((key) => `
      <div class="image-slot" data-key="${key}">
        <img class="thumb" src="${esc(state.images[key])}" alt="${esc(IMAGE_LABELS[key])}">
        <div class="slot-body">
          <div class="slot-name">${esc(IMAGE_LABELS[key])}</div>
          <div class="slot-actions">
            <label class="btn btn-gold btn-sm">
              <i data-lucide="image-plus"></i> Remplacer
              <input type="file" accept="image/*" hidden>
            </label>
            <button class="btn btn-ghost btn-sm reset">Défaut</button>
          </div>
        </div>
      </div>`).join('');

    $$('.image-slot', ed).forEach((slot) => {
      const key  = slot.dataset.key;
      const file = $('input[type=file]', slot);
      const img  = $('.thumb', slot);
      $('label', slot).addEventListener('click', () => file.click());
      file.addEventListener('change', () => {
        const f = file.files[0];
        if (!f) return;
        downscaleToDataURL(f, 1600, (dataUrl) => {
          state.images[key] = dataUrl;
          img.src = dataUrl;
          markDirty();
          toast('Image mise à jour — pensez à publier');
        });
      });
      img.addEventListener('click', () => file.click());
      $('.reset', slot).addEventListener('click', () => {
        state.images[key] = MezurContent.DEFAULT.images[key];
        img.src = state.images[key];
        markDirty();
        toast('Image réinitialisée');
      });
    });
    refreshIcons();
  }

  function downscaleToDataURL(file, maxW, cb) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        let out;
        try { out = canvas.toDataURL('image/webp', 0.82); }
        catch (e) { out = canvas.toDataURL('image/jpeg', 0.85); }
        if (out.length > 2600000) out = canvas.toDataURL('image/jpeg', 0.7);
        cb(out);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /* ============ TEXTS EDITOR ============ */
  function renderTextsEditor() {
    const ed = $('#texts-editor');
    ed.innerHTML = Object.keys(TEXT_LABELS).map((key) => `
      <div class="text-field" data-key="${key}">
        <label>${esc(TEXT_LABELS[key])}</label>
        <textarea>${esc(state.texts[key])}</textarea>
      </div>`).join('');
    $$('.text-field', ed).forEach((f) => {
      const key = f.dataset.key;
      $('textarea', f).addEventListener('input', (e) => { state.texts[key] = e.target.value; markDirty(); });
    });
  }

  /* ============ HOURS EDITOR ============ */
  function renderHoursEditor() {
    const ed = $('#hours-editor');
    ed.innerHTML = state.hours.map((h, i) => {
      /* Valeur affichée dans le champ texte */
      const displayVal = h.ferme ? 'Fermé' : h.texte;
      /* Ancienne valeur horaire à restaurer si on décoché "Fermé" */
      const prevVal = h._openTexte != null ? h._openTexte : (h.ferme ? '' : h.texte);
      return `
        <div class="hours-row" data-i="${i}">
          <span class="day">${esc(h.jour)}</span>
          <input class="h-texte"
                 value="${esc(displayVal)}"
                 data-prev="${esc(prevVal)}"
                 placeholder="Ex : 12h – 14h / 19h – 22h"
                 ${h.ferme ? 'disabled' : ''}>
          <label class="toggle">
            <input type="checkbox" class="h-ferme" ${h.ferme ? 'checked' : ''} style="width:auto;">
            Fermé
          </label>
        </div>`;
    }).join('');

    $$('.hours-row', ed).forEach((row) => {
      const i   = +row.dataset.i;
      const txt = $('.h-texte', row);

      txt.addEventListener('input', (e) => {
        state.hours[i].texte = e.target.value;
        txt.dataset.prev = e.target.value;
        markDirty();
      });

      $('.h-ferme', row).addEventListener('change', (e) => {
        state.hours[i].ferme = e.target.checked;
        if (e.target.checked) {
          /* Sauvegarde les horaires actuels avant de passer à "Fermé" */
          state.hours[i]._openTexte = txt.value !== 'Fermé' ? txt.value : (txt.dataset.prev || '');
          txt.dataset.prev = state.hours[i]._openTexte;
          state.hours[i].texte = 'Fermé';
          txt.value = 'Fermé';
          txt.disabled = true;
        } else {
          /* Restaure les horaires sauvegardés */
          const restored = state.hours[i]._openTexte || txt.dataset.prev || '';
          state.hours[i].texte = restored;
          state.hours[i]._openTexte = undefined;
          txt.value = restored;
          txt.dataset.prev = restored;
          txt.disabled = false;
          txt.focus();
        }
        markDirty();
      });
    });
  }

  /* ============ CONTACT EDITOR ============ */
  function renderContactEditor() {
    const ed = $('#contact-editor');
    ed.innerHTML = `
      <label>Adresse<textarea id="c-adresse">${esc(state.contact.adresse)}</textarea></label>
      <label>Téléphone<input id="c-tel"   value="${esc(state.contact.tel)}"></label>
      <label>Email<input    id="c-email"  value="${esc(state.contact.email || '')}"></label>
      <label>Instagram<input id="c-insta" value="${esc(state.contact.instagram)}"></label>`;
    $('#c-adresse', ed).addEventListener('input', (e) => { state.contact.adresse   = e.target.value; markDirty(); });
    $('#c-tel',     ed).addEventListener('input', (e) => { state.contact.tel       = e.target.value; markDirty(); });
    $('#c-email',   ed).addEventListener('input', (e) => { state.contact.email     = e.target.value; markDirty(); });
    $('#c-insta',   ed).addEventListener('input', (e) => { state.contact.instagram = e.target.value; markDirty(); });
  }

  /* ============ SETTINGS ============ */
  function bindSettings() {
    $('#btn-export-json').addEventListener('click', () => {
      download('contenu-mezur.json', 'application/json', MezurContent.export());
    });
    $('#import-json').addEventListener('change', (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          MezurContent.import(reader.result);
          state = MezurContent.get();
          boot();
          clearDirty();
          toast('Contenu importé', 'ok');
        } catch (err) { toast('Fichier JSON invalide', 'err'); }
      };
      reader.readAsText(f);
      e.target.value = '';
    });
    $('#btn-reset-content').addEventListener('click', () => {
      if (!confirm('Réinitialiser tout le contenu au site d\'origine ? (Les réservations sont conservées.)')) return;
      MezurContent.reset();
      state = MezurContent.get();
      boot();
      clearDirty();
      toast('Contenu réinitialisé', 'ok');
    });
    $('#btn-change-pw').addEventListener('click', () => {
      const pw      = ($('#new-pw').value     || '').trim();
      const confirm = ($('#confirm-pw').value || '').trim();
      if (pw.length < 6) { toast('Mot de passe trop court (minimum 6 caractères)', 'err'); return; }
      if (pw !== confirm) { toast('Les mots de passe ne correspondent pas', 'err'); return; }
      setPw(pw);
      $('#new-pw').value = '';
      $('#confirm-pw').value = '';
      toast('Mot de passe modifié', 'ok');
    });
    refreshIcons();
  }

  /* ---------- Download helper ---------- */
  function download(filename, mime, content) {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* Avertir avant fermeture si non publié */
  window.addEventListener('beforeunload', (e) => {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  /* Reprise de session ou focus mot de passe */
  if (ssGet(SESSION_KEY) === '1') {
    openApp();
  } else {
    const pw = $('#login-pw');
    if (pw) pw.focus();
    refreshIcons();
  }

  window.__MEZUR_ADMIN_READY = true;
})();
