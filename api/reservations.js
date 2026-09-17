/* ============================================================
   MEZUR — Réservations, côté back office
   Fonction serverless Vercel (runtime Node).

   Pourquoi passer par ici plutôt que d'interroger Supabase depuis
   le navigateur : la clé publique du site n'a le droit que d'INSÉRER
   une réservation. Elle ne peut rien lire, sinon n'importe quel
   visiteur récupérerait le nom et le téléphone de tous les clients.
   La lecture se fait donc ici, avec la clé de service, qui ne quitte
   jamais le serveur, et uniquement pour une session déjà authentifiée
   par /api/admin-auth.

   Variables d'environnement :
     SUPABASE_URL               URL du projet Supabase (requis)
     SUPABASE_SERVICE_ROLE_KEY  clé « service_role » (requis, secrète)
     ADMIN_PASSWORD             sert à dériver la clé de session
     ADMIN_SESSION_SECRET       clé de signature (optionnelle)

   Routes :
     GET    /api/reservations           -> liste
     POST   /api/reservations           -> création manuelle
     PATCH  /api/reservations?id=...    -> { status }
     DELETE /api/reservations?id=...    -> suppression
   ============================================================ */
'use strict';

const crypto = require('crypto');

const COOKIE_NAME = 'mezur_admin';

/* ---------- Session (même schéma que api/admin-auth.js) ---------- */

const sha256hex = (s) => crypto.createHash('sha256').update(String(s), 'utf8').digest('hex');

function sessionSecret() {
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (explicit && explicit.trim()) return explicit.trim();
  const base = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || '';
  if (!base) return null;
  return sha256hex('mezur.session.v1|' + base);
}

function verifyToken(token, secret) {
  if (!token || !secret) return false;
  const parts = String(token).split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return false;
  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expected = crypto.createHmac('sha256', secret).update('v1.' + expiresAt).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(parts[2], 'hex'));
  } catch (e) {
    return false;
  }
}

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    if (part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

function estAuthentifie(req) {
  return verifyToken(readCookie(req, COOKIE_NAME), sessionSecret());
}

/* ---------- Supabase ---------- */

function configSupabase() {
  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return url && key ? { url, key } : null;
}

async function supabase(cfg, chemin, options) {
  const res = await fetch(cfg.url + '/rest/v1/' + chemin, Object.assign({}, options, {
    headers: Object.assign({
      apikey: cfg.key,
      Authorization: 'Bearer ' + cfg.key,
      'Content-Type': 'application/json'
    }, (options && options.headers) || {})
  }));

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    const err = new Error('Supabase ' + res.status + (detail ? ' : ' + detail.slice(0, 200) : ''));
    err.statut = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

/* ---------- Corps de requête ---------- */

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 64 * 1024) break;
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch (e) { return {}; }
}

/* Liste blanche : le back office ne décide pas des colonnes écrites. */
const CHAMPS_AUTORISES = [
  'date', 'service', 'time', 'covers', 'occasion',
  'nom', 'prenom', 'telephone', 'email', 'message', 'status'
];

function nettoyer(objet) {
  const out = {};
  CHAMPS_AUTORISES.forEach((k) => {
    if (objet[k] !== undefined && objet[k] !== '') out[k] = objet[k];
  });
  return out;
}

const STATUTS = ['nouvelle', 'confirmee', 'annulee', 'no-show'];

/* ---------- Point d'entrée ---------- */

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (!estAuthentifie(req)) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: 'Session expirée. Reconnectez-vous.' }));
  }

  const cfg = configSupabase();
  if (!cfg) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      error: 'Base non configurée : définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans Vercel.'
    }));
  }

  const url = new URL(req.url, 'http://localhost');
  const id = url.searchParams.get('id');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    if (req.method === 'GET') {
      const lignes = await supabase(cfg, 'reservations?select=*&order=date.desc,time.desc', {
        method: 'GET'
      });
      return res.end(JSON.stringify(lignes || []));
    }

    if (req.method === 'POST') {
      const corps = nettoyer(await readJsonBody(req));
      if (!corps.date || !corps.time || !corps.nom) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Date, heure et nom sont nécessaires.' }));
      }
      const cree = await supabase(cfg, 'reservations', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(corps)
      });
      res.statusCode = 201;
      return res.end(JSON.stringify((cree || [])[0] || corps));
    }

    if (req.method === 'PATCH') {
      if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Identifiant manquant.' }));
      }
      const corps = await readJsonBody(req);
      if (STATUTS.indexOf(corps.status) === -1) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Statut inconnu.' }));
      }
      await supabase(cfg, 'reservations?id=eq.' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: corps.status })
      });
      return res.end(JSON.stringify({ ok: true }));
    }

    if (req.method === 'DELETE') {
      if (!id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Identifiant manquant.' }));
      }
      await supabase(cfg, 'reservations?id=eq.' + encodeURIComponent(id), {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' }
      });
      return res.end(JSON.stringify({ ok: true }));
    }

    res.statusCode = 405;
    res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
    return res.end(JSON.stringify({ error: 'Méthode non autorisée.' }));

  } catch (e) {
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: e.message || 'Base injoignable.' }));
  }
};
