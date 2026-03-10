function required(name) {
  const v = (process.env[name] || '').trim();
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

import fs from 'node:fs';
import path from 'node:path';

function loadDotEnvLocalhost() {
  const p = path.resolve(process.cwd(), '.env.localhost');
  if (!fs.existsSync(p)) return;
  const txt = fs.readFileSync(p, 'utf8');
  for (const line of txt.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    let v = trimmed.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

loadDotEnvLocalhost();

const env = (process.env.AIRWALLEX_ENV || 'sandbox').trim().toLowerCase();
const baseUrl = (process.env.AIRWALLEX_BASE_URL || (env === 'production' ? 'https://api.airwallex.com' : 'https://api-demo.airwallex.com')).replace(/\/$/, '');

const clientId = required('AIRWALLEX_CLIENT_ID');
const apiKey = required('AIRWALLEX_API_KEY');

async function login() {
  const res = await fetch(`${baseUrl}/api/v1/authentication/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-client-id': clientId,
      'x-api-key': apiKey,
    },
    body: JSON.stringify({}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`login failed: ${res.status} ${JSON.stringify(json)}`);
  const token = json.token || json.access_token;
  if (!token) throw new Error(`login response missing token: ${JSON.stringify(json)}`);
  return token;
}

async function tryGet(token, path) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { _raw: text }; }
  return { ok: res.ok, status: res.status, path, json };
}

function pickId(json) {
  if (!json) return null;
  if (typeof json.id === 'string') return json.id;
  const arr = Array.isArray(json.items) ? json.items : Array.isArray(json.data) ? json.data : Array.isArray(json.results) ? json.results : null;
  if (arr && arr.length) {
    const first = arr[0];
    if (first && typeof first.id === 'string') return first.id;
  }
  return null;
}

const LEGAL_ENTITY_ENDPOINTS = [
  // Some environments may not expose these endpoints; we keep them for discovery.
  '/api/v1/legal_entities',
  '/api/v1/legal_entities/list',
  '/api/v1/legal_entities?limit=50',
];

const LINKED_PAYMENT_ACCOUNT_ENDPOINTS = [
  '/api/v1/linked_payment_accounts',
  '/api/v1/linked_payment_accounts/list',
  '/api/v1/linked_payment_accounts?limit=50',
  '/api/v1/payment_accounts',
  '/api/v1/payment_accounts/list',
  // Per Airwallex docs, "accounts" endpoint exists at least for some products.
  '/api/v1/accounts?page_num=0&page_size=20',
  '/api/v1/accounts',
];

const token = await login();

console.log(`Airwallex env=${env} baseUrl=${baseUrl}`);

console.log('\n=== Legal entities (trying endpoints) ===');
let legalEntity = null;
for (const p of LEGAL_ENTITY_ENDPOINTS) {
  const r = await tryGet(token, p);
  console.log(`\nGET ${p} -> ${r.status} ok=${r.ok}`);
  if (r.ok && !legalEntity) {
    legalEntity = pickId(r.json);
  }
}
console.log(`\nLEGAL_ENTITY_ID candidate: ${legalEntity || '(not found)'}`);

console.log('\n=== Linked payment accounts (trying endpoints) ===');
let linked = null;
for (const p of LINKED_PAYMENT_ACCOUNT_ENDPOINTS) {
  const r = await tryGet(token, p);
  console.log(`\nGET ${p} -> ${r.status} ok=${r.ok}`);
  if (r.ok && !linked) {
    linked = pickId(r.json);
  }
}
console.log(`\nLINKED_PAYMENT_ACCOUNT_ID candidate: ${linked || '(not found)'}`);

console.log(`\nNote: if you're seeing 401 for all discovery endpoints, Airwallex may require an account context header (x-login-as) or the endpoints may not be enabled for this sandbox org.`);
console.log('Next step: try the UI-based IDs (Billing settings / Payments settings), OR paste one 401 response body from any endpoint so we can see the exact error code/message.');
