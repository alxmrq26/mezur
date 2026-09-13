/* ============================================================
   MEZUR — Authentification du back office
   Fonction serverless Vercel (runtime Node).

   Le mot de passe n'existe QUE côté serveur, dans les variables
   d'environnement Vercel. Il n'est jamais envoyé au navigateur.

   Variables d'environnement :
     ADMIN_PASSWORD        mot de passe du back office (requis)
     ADMIN_PASSWORD_HASH   alternative : SHA-256 hex du mot de passe
                           (prioritaire sur ADMIN_PASSWORD si défini)
     ADMIN_SESSION_SECRET  clé de signature des sessions (optionnelle,
                           dérivée du mot de passe si absente)

   Routes :
     POST   /api/admin-auth  { password }  -> connexion (pose le cookie)
     GET    /api/admin-auth               -> état de la session
     DELETE /api/admin-auth               -> déconnexion
   ============================================================ */
'use strict';

const crypto = require('crypto');

const COOKIE_NAME   = 'mezur_admin';
const SESSION_MAX_AGE = 60 * 60 * 8;      // 8 heures
const RL_WINDOW_MS    = 10 * 60 * 1000;   // fenêtre anti-force brute
const RL_MAX_FAILS    = 10;

/* ---------- Helpers crypto ---------- */

const sha256hex = (s) => crypto.createHash('sha256').update(String(s), 'utf8').digest('hex');

function safeEqual(a, b) {
  const ba = Buffer.from(String(a), 'utf8');
  const bb = Buffer.from(String(b), 'utf8');
  // Longueurs comparées via un hash pour rester en temps constant
  const ha = crypto.createHash('sha256').update(ba).digest();
  const hb = crypto.createHash('sha256').update(bb).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function sessionSecret() {
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (explicit && explicit.trim()) return explicit.trim();
  // À défaut, on dérive une clé stable du mot de passe configuré :
  // changer le mot de passe invalide alors les sessions en cours.
  const base = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || '';
  if (!base) return null;
  return sha256hex('mezur.session.v1|' + base);
}

/** true = mot de passe correct, false = incorrect, null = non configuré */
function checkPassword(input) {
  const hash = (process.env.ADMIN_PASSWORD_HASH || '').trim().toLowerCase();
  if (hash) return safeEqual(sha256hex(input), hash);
  const plain = process.env.ADMIN_PASSWORD;
  if (plain) return safeEqual(input, plain);
  return null;
}

/* ---------- Jeton de session (HMAC signé) ---------- */

function signToken(expiresAt, secret) {
  const payload = 'v1.' + expiresAt;
  const mac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return payload + '.' + mac;
}

function verifyToken(token, secret) {
  if (!token || !secret) return false;
  const parts = String(token).split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return false;
  const expiresAt = Number(parts[1]);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expected = crypto.createHmac('sha256', secret).update('v1.' + expiresAt).digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(parts[2], 'hex')); }
  catch (e) { return false; }
}

/* ---------- Cookies ---------- */

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    if (part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

function isLocalHost(req) {
  const host = String(req.headers.host || '');
  return host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('[::1]');
}

function cookieHeader(req, value, maxAge) {
  const bits = [
    COOKIE_NAME + '=' + encodeURIComponent(value),
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=' + maxAge
  ];
  if (!isLocalHost(req)) bits.push('Secure');
  return bits.join('; ');
}

/* ---------- Limitation des tentatives (best-effort, par instance) ---------- */

const failures = new Map();

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd) return fwd.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function tooManyFailures(ip) {
  const entry = failures.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > RL_WINDOW_MS) { failures.delete(ip); return false; }
  return entry.count >= RL_MAX_FAILS;
}

function recordFailure(ip) {
  const entry = failures.get(ip);
  if (!entry || Date.now() - entry.first > RL_WINDOW_MS) failures.set(ip, { count: 1, first: Date.now() });
  else entry.count += 1;
}

/* ---------- Corps de requête ---------- */

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 8 * 1024) break;           // un mot de passe ne pèse pas 8 Ko
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (e) { return {}; }
}

/* ---------- Handler ---------- */

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const secret = sessionSecret();

  /* --- Déconnexion --- */
  if (req.method === 'DELETE' || (req.method === 'POST' && req.query && req.query.action === 'logout')) {
    res.setHeader('Set-Cookie', cookieHeader(req, '', 0));
    res.status(200).end(JSON.stringify({ ok: true }));
    return;
  }

  /* --- État de la session --- */
  if (req.method === 'GET') {
    const ok = verifyToken(readCookie(req, COOKIE_NAME), secret);
    res.status(ok ? 200 : 401).end(JSON.stringify({ ok, configured: checkPassword('') !== null }));
    return;
  }

  /* --- Connexion --- */
  if (req.method === 'POST') {
    const ip = clientIp(req);
    if (tooManyFailures(ip)) {
      res.status(429).end(JSON.stringify({ ok: false, error: 'too_many_attempts' }));
      return;
    }

    const body = await readJsonBody(req);
    const password = typeof body.password === 'string' ? body.password : '';

    const result = checkPassword(password);
    if (result === null) {
      res.status(503).end(JSON.stringify({ ok: false, error: 'not_configured' }));
      return;
    }
    if (!result || !password) {
      recordFailure(ip);
      res.status(401).end(JSON.stringify({ ok: false, error: 'invalid_password' }));
      return;
    }

    failures.delete(ip);
    const token = signToken(Date.now() + SESSION_MAX_AGE * 1000, secret);
    res.setHeader('Set-Cookie', cookieHeader(req, token, SESSION_MAX_AGE));
    res.status(200).end(JSON.stringify({ ok: true }));
    return;
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  res.status(405).end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
};
