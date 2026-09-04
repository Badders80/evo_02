/**
 * @evo/ui primitives — structural class-string tests. No DOM: components return
 * React elements, so assert on element props. Every canonical string below is
 * pinned by the style guide (STYLE_GUIDE-draft.md Part 2) + evidence file:line.
 */

import assert from 'node:assert';
import { Eyebrow } from '../src/eyebrow';
import { BackLink } from '../src/back-link';
import { StatusPill } from '../src/status-pill';
import { StatRow } from '../src/stat-row';
import { WhitePillCTA } from '../src/white-pill-cta';
import { cn } from '../src/cn';

console.log('Running @evo/ui primitives tests...');

// cn — clsx + tailwind-merge
{
  assert.equal(cn('a', 'b'), 'a b');
  assert.equal(cn('text-gold', 'text-gold'), 'text-gold', 'twMerge dedupes');
}

// Eyebrow — P1 (right-rail.tsx:174)
{
  const el: any = Eyebrow({ children: 'Ownership' });
  assert.equal(el.props.className, 'text-gold text-[11px] font-medium uppercase tracking-[0.2em]');
  assert.equal(el.props.children, 'Ownership');
}

// BackLink — P3 (marketplace/[slug]/page.tsx:148)
{
  const el: any = BackLink({ href: '/marketplace/foo', children: 'Back to horses' });
  assert.equal(el.props.href, '/marketplace/foo');
  assert.ok(
    el.props.className.includes('inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent transition-colors'),
    'BackLink canonical classes'
  );
  const [arrow, label] = el.props.children;
  assert.equal(label, 'Back to horses');
  assert.equal(arrow.props.className, 'h-3.5 w-3.5', 'ArrowLeft size');
}

// StatusPill — P4 variant matrix (right-rail.tsx:42,51,60,68)
{
  const listed: any = StatusPill({ status: 'listed' });
  assert.ok(listed.props.className.includes('border-status-active/40 bg-status-active/10 text-status-active'));
  assert.ok(listed.props.className.includes('rounded-full border px-3 py-1.5 text-[8px] font-medium uppercase tracking-widest'));
  const [dot, label] = listed.props.children;
  assert.equal(dot.props.className, 'h-2 w-2 rounded-full bg-status-active');
  assert.equal(label.props.children, 'Become An Owner');

  const sub: any = StatusPill({ status: 'fully_subscribed' });
  assert.ok(sub.props.className.includes('border-accent/40 bg-accent/10 text-accent'));
  assert.equal(sub.props.children[1].props.children, 'Fully Subscribed');

  const soon: any = StatusPill({ status: 'coming_soon' });
  assert.equal(soon.props.children[1].props.children, 'Coming Soon');

  const done: any = StatusPill({ status: 'completed' });
  assert.ok(done.props.className.includes('border-border bg-card text-muted-foreground'));
  assert.equal(done.props.children[1].props.children, 'Campaign Concluded');
}

// StatRow — P5 (right-rail.tsx:184,194,202)
{
  const el: any = StatRow({ label: 'Price', value: '$3,800', unit: 'per month', sub: 'for a 1.0% stake' });
  const [label, row] = el.props.children;
  assert.equal(label.props.className, 'text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground block mb-1');
  assert.equal(label.props.children, 'Price');
  const [value, unit] = row.props.children;
  assert.equal(value.props.className, 'text-[30px] font-light tracking-tight text-heading leading-tight');
  assert.equal(value.props.children, '$3,800');
  assert.equal(unit.props.children, 'per month');
}

// WhitePillCTA — P6a (right-rail.tsx:240)
{
  const el: any = WhitePillCTA({ children: 'Become an Owner →' });
  assert.ok(
    el.props.className.includes('flex w-full items-center justify-center gap-2 rounded-full bg-pure-white px-8 py-3 text-base font-bold tracking-wide text-black transition-colors hover:bg-white/90'),
    'WhitePillCTA canonical classes'
  );
  assert.equal(el.props.type, 'button');
  assert.equal(el.props.children, 'Become an Owner →');
}

console.log('@evo/ui primitives tests passed.');
