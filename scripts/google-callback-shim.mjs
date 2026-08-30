#!/usr/bin/env node
// Google OAuth callback shim — LOCAL DEV ONLY.
//
// The inherited Google OAuth client (from evo_01's NextAuth era) only has
// http://localhost:3000/api/auth/callback/google registered as a redirect
// URI, and Console registration can't be edited via CLI. App-mediated OAuth
// therefore presents that registered URI while LOCAL (see
// GOOGLE_OAUTH_REDIRECT_URI in apps/web/.env.local), and this tiny listener
// receives the resulting ?code=... and forwards everything to the web app's
// real callback on :3010 (/api/auth/google/callback), preserving
// code/state/scope/next/error verbatim (state = "<csrfHash>.<next>").
//
// Usage: node scripts/google-callback-shim.mjs   (leave running during dev)

import { createServer } from 'node:http';

const APP_ORIGIN = process.env.SHIM_APP_ORIGIN || 'http://localhost:3010';
const PORT = Number(process.env.SHIM_PORT || 3000);

createServer((req, res) => {
  const incoming = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  if (incoming.pathname !== '/api/auth/callback/google') {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('shim: not found');
    return;
  }
  const target = new URL('/api/auth/google/callback', APP_ORIGIN);
  for (const key of ['code', 'state', 'scope', 'authuser', 'prompt', 'error', 'error_description']) {
    const val = incoming.searchParams.get(key);
    if (val !== null) target.searchParams.set(key, val);
  }
  res.writeHead(302, { location: target.toString() }).end();
}).listen(PORT, () => {
  console.log(`[google-callback-shim] listening on :${PORT} -> ${APP_ORIGIN}/api/auth/google/callback`);
});
