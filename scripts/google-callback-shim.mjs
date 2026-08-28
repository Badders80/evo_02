#!/usr/bin/env node
// Google OAuth callback shim — LOCAL DEV ONLY.
//
// The inherited Google OAuth client (from evo_01's NextAuth era) only has
// http://localhost:3000/api/auth/callback/google registered as a redirect
// URI, and Google's Console registration can't be edited via CLI. So the
// local Supabase GoTrue presents that URI to Google (supabase/config.toml
// -> auth.external.google.redirect_uri), and this tiny listener receives
// the resulting ?code=... and forwards it to the web app's real exchange
// route on :3010, preserving ?next=.
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
  const target = new URL('/auth/callback', APP_ORIGIN);
  for (const key of ['code', 'state', 'scope', 'authuser', 'prompt', 'error']) {
    const val = incoming.searchParams.get(key);
    if (val !== null) target.searchParams.set(key, val);
  }
  // Supabase puts the deep-link destination inside the OAuth `state` param
  // as JSON ({"next": "..."}); unwrap it so the app callback can redirect.
  try {
    const state = JSON.parse(incoming.searchParams.get('state') ?? '{}');
    if (state && typeof state.next === 'string') {
      target.searchParams.set('next', state.next);
    }
  } catch {
    // state was not Supabase JSON — ignore; app callback falls back safely
  }
  res.writeHead(302, { location: target.toString() }).end();
}).listen(PORT, () => {
  console.log(`[google-callback-shim] listening on :${PORT} -> ${APP_ORIGIN}/auth/callback`);
});