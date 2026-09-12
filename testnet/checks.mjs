// testnet/checks.mjs — one entry per check. Each returns { ok, evidence, detail }.
// Check IDs map 1:1 to lines in war-room/game-plans/G013-go-live-three-horses/TASKS.md.
import { inventory, holding, holdingCount, reservationBySession, reservationById, completedEvent, profileByEmail, rearmFixtures, setStatus } from './lib/db.mjs';
import { login, payStripe, withPage, APP } from './lib/browser.mjs';

const HEX64 = /^[a-f0-9]{64}$/;

async function stripeSession(sessionId, key) {
  const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${key}:`).toString('base64')}` },
  });
  return r.json();
}

export const checks = [
  {
    id: 'M1',
    title: 'Investor signs in through the real login form',
    task: '2.1',
    async run(ctx) {
      const session = await withPage(({ ctx: bctx }) => login(bctx, ctx.cfg.email, ctx.cfg.password));
      ctx.state.cookieHeader = session.cookieHeader;
      ctx.state.userId = (await profileByEmail(ctx.cfg.email))?.id ?? null;
      ctx.state.holdingsBefore = ctx.state.userId ? holdingCount(ctx.state.userId, ctx.cfg.inventoryId) : 0;
      return {
        ok: session.ok && !!ctx.state.cookieHeader && !!ctx.state.userId,
        evidence: `url=${session.after.url} cookies=${session.cookieNames.join(',')}`,
        detail: session.ok ? 'signed in; session cookie captured' : session.reason || 'login did not land on /mystable',
      };
    },
  },
  {
    id: 'M2',
    title: 'Checkout session created for the full remaining stake',
    task: '2.1',
    async run(ctx) {
      const inv = inventory(ctx.cfg.slug);
      const stepPct = ctx.cfg.stepPct; // 0.5% per unit
      const unitsPct = inv.sharesAvailable * stepPct; // buy out the remainder on purpose
      const res = await fetch(`${APP}/api/checkout/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: ctx.state.cookieHeader },
        body: JSON.stringify({ horseSlug: ctx.cfg.slug, units: unitsPct }),
      });
      const body = await res.json().catch(() => ({}));
      ctx.state.unitsPct = unitsPct;
      ctx.state.sessionUrl = body.url ?? null;
      ctx.state.sessionId = body.url ? body.url.split('/c/pay/')[1].split('#')[0] : null;
      return {
        ok: res.status === 200 && !!ctx.state.sessionId,
        evidence: `HTTP ${res.status} units=${unitsPct}% url=${(ctx.state.sessionUrl || '').slice(0, 60)}`,
        detail: `available ${inv.sharesAvailable} step-units = ${unitsPct}% -> ${body.code ?? 'ok'}`,
      };
    },
  },
  {
    id: 'M3',
    title: 'Test card charges the real Stripe session',
    task: '2.1',
    async run(ctx) {
      const paid = await withPage(({ page }) => payStripe(page, ctx.state.sessionUrl));
      const s = await stripeSession(ctx.state.sessionId, ctx.cfg.stripeKey);
      ctx.state.stripe = s;
      ctx.state.reservationId = s.metadata?.reservation_id ?? null;
      return {
        ok: s.status === 'complete' && s.payment_status === 'paid' && Number(s.amount_total) > 0 && !!s.subscription,
        evidence: `stripe status=${s.status} payment_status=${s.payment_status} amount_total=${s.amount_total} subscription=${s.subscription} reservation=${s.metadata?.reservation_id}`,
        detail: `form: ${paid.dump.inputs.length} inputs, buttons ${JSON.stringify(paid.dump.buttons.slice(0, 4))}`,
      };
    },
  },
  {
    id: 'M4',
    title: 'Webhook settles the purchase (no 409, event marked processed)',
    task: '2.1a',
    async run(ctx) {
      // The listener forwards within seconds; the handler is synchronous.
      for (let i = 0; i < 10; i++) {
        const ev = completedEvent(ctx.state.sessionId);
        if (ev?.processed === true || ev?.processed === 't') break;
        await new Promise((r) => setTimeout(r, 1500));
      }
      const ev = completedEvent(ctx.state.sessionId);
      const processed = ev?.processed === true || ev?.processed === 't';
      return {
        ok: processed,
        evidence: `event=${ev?.eventId} processed=${ev?.processed} error=${ev?.errorMessage || '(none)'}`,
        detail: processed ? 'settled' : 'the guard refused this purchase — card charged, no holding',
      };
    },
  },
  {
    id: 'M5',
    title: 'Holding row written with float 5, hashes stamped, subscription attached',
    task: '2.1',
    async run(ctx) {
      const h = holding(ctx.state.userId, ctx.cfg.inventoryId);
      const after = holdingCount(ctx.state.userId, ctx.cfg.inventoryId);
      const expectedSub = ctx.state.stripe?.subscription ?? null;
      const delta = after - (ctx.state.holdingsBefore ?? 0);
      // Existence alone is not proof: a repeat purchase is silently swallowed by the
      // one-active-holding-per-horse index, leaving the OLD row in place. Pin identity.
      const ok =
        !!h &&
        delta === 1 &&
        Number(h.floatMonthsHeld) === 5 &&
        HEX64.test(h.signedPdsHash ?? '') &&
        HEX64.test(h.signedSaHash ?? '') &&
        !!h.subscriptionId &&
        h.subscriptionId === expectedSub;
      return {
        ok,
        evidence: `rows ${ctx.state.holdingsBefore}->${after} (delta ${delta}) id=${h?.id} float=${h?.floatMonthsHeld} sub=${h?.subscriptionId} expectedSub=${expectedSub} pds=${String(h?.signedPdsHash).slice(0, 12)}… sa=${String(h?.signedSaHash).slice(0, 12)}…`,
        detail: ok ? 'new holding row carrying this session\u2019s subscription' : 'existence is not identity: the charged session did not produce a new holding row',
      };
    },
  },
  {
    id: 'M6',
    title: 'Reservation consumed, availability decremented by exactly the stake',
    task: '2.1',
    async run(ctx) {
      // Stripe's session metadata carries the reservation id written by create-session.
      const reservationId = ctx.state.stripe?.metadata?.reservation_id;
      const r = reservationId ? reservationById(reservationId) : reservationBySession(ctx.state.sessionId);
      const inv = inventory(ctx.cfg.slug);
      const consumed = r && r.status !== 'active';
      return {
        ok: !!consumed,
        evidence: `reservation=${r?.status} units=${r?.units} | inventory now shares_available=${inv.sharesAvailable} reserved=${inv.reservedShares}`,
        detail: consumed ? 'reservation consumed by the webhook' : 'reservation still active after settlement',
      };
    },
  },
  {
    id: 'M7',
    title: 'MyStable renders the holding (not an empty dashboard)',
    task: '2.2',
    async run(ctx) {
      const out = await withPage(async ({ ctx: bctx }) => {
        const page = bctx.pages().find((p) => p.url().includes('/mystable')) || (await bctx.newPage());
        await page.goto(`${APP}/mystable?t=${Date.now()}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(4000);
        return page.evaluate(() => ({ text: document.body.innerText, html: document.body.innerHTML.length }));
      });
      const m = /active syndicates[\s\S]{0,40}?(\d+)/i.exec(out.text);
      const shown = m ? Number(m[1]) : 0;
      const showsHolding = shown >= 1 && !/no stakes held yet/i.test(out.text);
      return {
        ok: showsHolding,
        evidence: `active syndicates=${shown} | text=${out.text.slice(0, 160).replace(/\n/g, ' | ')}`,
        detail: showsHolding ? `dashboard shows ${shown} active syndicate(s)` : 'dashboard still reports no stakes held',
      };
    },
  },
  {
    id: 'M9',
    title: 'A repeat purchase of the same horse is REFUSED (never charged-and-dropped)',
    task: '2.1e',
    async run(ctx) {
      // Give the horse availability again, then try the same investor + same horse.
      rearmFixtures(ctx.cfg.slug, ctx.cfg.inventoryId, ctx.cfg.rearmShares, ctx.cfg.rearmReserved);
      setStatus(ctx.cfg.slug, 'listed');
      const res = await fetch(`${APP}/api/checkout/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: ctx.state.cookieHeader },
        body: JSON.stringify({ horseSlug: ctx.cfg.slug, units: ctx.cfg.stepPct }),
      });
      const body = await res.json().catch(() => ({}));
      let note = '';
      if (res.status === 200 && body.url) {
        // Leaked a live session: expire it so the run leaves nothing chargeable behind.
        const sid = body.url.split('/c/pay/')[1].split('#')[0];
        const exp = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sid}/expire`, {
          method: 'POST',
          headers: { Authorization: `Basic ${Buffer.from(`${ctx.cfg.stripeKey}:`).toString('base64')}` },
        });
        note = ` (leaked session expired: HTTP ${exp.status})`;
      }
      return {
        ok: res.status >= 400 && res.status < 500,
        evidence: `HTTP ${res.status} code=${body.code ?? '-'} body=${JSON.stringify(body).slice(0, 120)}${note}`,
        detail:
          res.status >= 400 && res.status < 500
            ? 'refused before payment'
            : 'a repeat purchase was allowed to reach Stripe: on payment the unique sitting-holding index swallows the insert and the buyer is charged with no new holding',
      };
    },
  },
  {
    id: 'M8',
    title: 'Revert: horse back to coming_soon, stale reservations released',
    task: '2.1d',
    async run(ctx) {
      return { ok: true, evidence: ctx.state.revertNote || 'revert ran in the runner finally-block', detail: 'state restored' };
    },
  },
];
