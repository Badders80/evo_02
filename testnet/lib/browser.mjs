// testnet/lib/browser.mjs — local headless Chromium over CDP (the Hermes browser backend
// cannot reach localhost, and the Playwright *package* is not a repo dependency — the
// binaries and playwright-core are already on this box, so we use them by path).
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';

const require_ = createRequire(import.meta.url);
const PW_CORE =
  process.env.TESTNET_PLAYWRIGHT_CORE || '/home/evo/.hermes/hermes-agent/node_modules/playwright-core';
const PORT = Number(process.env.TESTNET_CDP_PORT || 9222);
export const APP = process.env.TESTNET_APP_URL || 'http://localhost:3000';

/** Newest cached Playwright chromium (full chrome layout, takes --headless=new). */
export function chromiumPath() {
  if (process.env.TESTNET_CHROME) return process.env.TESTNET_CHROME;
  const root = join(process.env.HOME, '.cache/ms-playwright');
  const dirs = existsSync(root)
    ? readdirSync(root)
        .filter((d) => /^chromium-\d+$/.test(d))
        .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]))
    : [];
  for (const d of dirs) {
    const bin = join(root, d, 'chrome-linux64/chrome');
    if (existsSync(bin)) return bin;
  }
  throw new Error('no Playwright chromium found — check ~/.cache/ms-playwright');
}

async function cdpUp() {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/version`, { signal: AbortSignal.timeout(2500) });
    return r.ok;
  } catch {
    return false;
  }
}

/** Starts headless chromium if the CDP port is not already live. Never kills a running one. */
export async function ensureChromium() {
  if (await cdpUp()) return { started: false };
  const bin = chromiumPath();
  const child = spawn(
    bin,
    [
      '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
      `--remote-debugging-port=${PORT}`, '--remote-debugging-address=127.0.0.1',
      `--user-data-dir=${process.env.HOME}/.cache/testnet-chrome`, 'about:blank',
    ],
    { detached: true, stdio: 'ignore' }
  );
  child.unref();
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await cdpUp()) return { started: true, pid: child.pid, bin };
  }
  throw new Error(`chromium did not expose CDP on :${PORT} within 15s`);
}

/**
 * Runs fn against a connected browser. Disconnects afterwards; leaves the browser alive
 * so a later check reuses the same session cookies.
 */
export async function withPage(fn) {
  const { chromium } = require_(PW_CORE);
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`);
  try {
    const ctx = browser.contexts()[0] || (await browser.newContext());
    const page = ctx.pages().find((p) => p.url().startsWith(APP)) || ctx.pages()[0] || (await ctx.newPage());
    return await fn({ browser, ctx, page });
  } finally {
    await browser.close();
  }
}

/** Signs in through the real /auth/login form and returns the session cookie header. */
export async function login(ctx, email, password) {
  const page = ctx.pages().find((p) => p.url().startsWith(APP)) || (await ctx.newPage());
  const net = [];
  page.on('response', (r) => {
    if (r.url().includes('/auth/v1/') || r.url().includes('/api/')) net.push(`${r.status()} ${r.request().method()} ${r.url().replace(APP, '')}`);
  });
  await page.goto(`${APP}/login?t=${Date.now()}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const inputs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('input')).map((i) => ({ id: i.id, type: i.type, visible: i.offsetParent !== null }))
  );
  if (!inputs.some((i) => i.type === 'email') || !inputs.some((i) => i.type === 'password')) {
    return { ok: false, reason: 'no email/password inputs on the login form', inputs, net };
  }
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  // Exact "SIGN IN" only — a /continue/i match grabs "CONTINUE WITH GOOGLE" and leaves the app.
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter((b) => b.offsetParent !== null);
    const go = btns.find((b) => b.innerText.trim().toLowerCase() === 'sign in') || btns.find((b) => b.type === 'submit' && !/google/i.test(b.innerText));
    if (go) go.click();
  });
  await page.waitForTimeout(6000);
  const after = await page.evaluate(() => ({ url: location.href, text: document.body.innerText.slice(0, 400) }));
  const cookies = await ctx.cookies(APP);
  const auth = cookies.filter((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
  return { ok: after.url.includes('/mystable') && auth.length > 0, after, cookieHeader: auth.map((c) => `${c.name}=${c.value}`).join('; '), net, cookieNames: cookies.map((c) => c.name) };
}

/** Completes a hosted Stripe Checkout session with a test card (4242…). */
export async function payStripe(page, url) {
  const net = [];
  page.on('response', (r) => {
    if (/stripe\.com|localhost/.test(r.url())) net.push(`${r.status()} ${r.request().method()} ${r.url().slice(0, 120)}`);
  });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const dump = await page.evaluate(() => ({
    url: location.href,
    inputs: Array.from(document.querySelectorAll('input')).map((i) => ({ ac: i.autocomplete, name: i.name, visible: i.offsetParent !== null })),
    buttons: Array.from(document.querySelectorAll('button')).filter((b) => b.offsetParent !== null).map((b) => (b.innerText || '').trim().slice(0, 30)),
  }));
  if (!(await page.$('input[autocomplete="cc-number"]'))) {
    await page.evaluate(() => {
      const t = document.querySelector('[data-testid="card-accordion-item-button"]');
      if (t) t.click();
    });
    await page.waitForTimeout(3000);
  }
  await page.waitForSelector('input[autocomplete="cc-number"]', { timeout: 20000 });
  await page.fill('input[autocomplete="cc-number"]', '4242424242424242');
  await page.fill('input[autocomplete="cc-exp"]', '12/34');
  await page.fill('input[autocomplete="cc-csc"]', '123');
  for (const [sel, val] of [
    ['input[autocomplete="cc-name"]', 'Test Investor'],
    ['input[autocomplete="postal-code"], input[name="postalCode"]', '0624'],
  ]) {
    const el = await page.$(sel);
    if (el) await el.fill(val);
  }
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).filter((b) => b.offsetParent !== null && !b.disabled);
    const go = btns.find((b) => /pay|subscribe|start|complete/i.test(b.innerText)) || btns[btns.length - 1];
    if (go) go.click();
  });
  await page.waitForTimeout(15000);
  return { dump, after: await page.evaluate(() => ({ url: location.href, text: document.body.innerText.slice(0, 300) })), net };
}
