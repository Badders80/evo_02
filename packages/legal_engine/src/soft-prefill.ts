/**
 * Soft-content pre-fill — composes the 4 PDS soft sections from engine/content
 * (same registries that feed the website) + inventory hard facts.
 *
 * Rule: DB (soft_legal) always wins when present. This only drafts blanks.
 * Never invents: unknown horse/section → '' (blank placeholder downstream).
 */
import fs from 'fs';
import path from 'path';

export const CONTENT_DIR = '/home/evo/evolution/engine/content';

export interface PrefillInput {
  horseSlug: string;
  stableSlug?: string;
  sirePedigreeSlug?: string;
  trainerPersonSlugs?: string[];
  barnName?: string;
  legalName?: string;
  racingStatus?: string;
}

export interface PrefillResult {
  aboutHorse: string;
  trainerBio: string;
  racingOutlookAndPedigree: string;
  raceExpectation: string;
  provenance: string[];
}

function readMd(p: string): string | null {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

/** Extract the body of the first ## heading matching `match` (case-insensitive, prefix). */
export function sectionOf(md: string, match: (h: string) => boolean): string {
  const lines = md.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^##\s+(.+?)\s*$/);
    if (m && match(m[1].toLowerCase())) {
      start = i + 1;
      break;
    }
  }
  if (start === -1) return '';
  const out: string[] = [];
  for (let i = start; i < lines.length; i++) {
    if (/^#{1,2}\s+/.test(lines[i])) break;
    out.push(lines[i]);
  }
  // Strip provenance italics + Images sections leaking in.
  return out
    .join('\n')
    .replace(/^_Migrated .*$/m, '')
    .replace(/^_This is a living document.*$/m, '')
    .trim();
}

export function prefillSoftSections(input: PrefillInput): PrefillResult {
  const provenance: string[] = [];
  const horseMd = readMd(path.join(CONTENT_DIR, 'horses', input.horseSlug, 'profile.md'));

  let aboutHorse = '';
  if (horseMd) {
    aboutHorse = sectionOf(horseMd, (h) => h === 'profile');
    if (aboutHorse) provenance.push(`horses/${input.horseSlug}/profile.md ## Profile`);
  }

  let trainerBio = '';
  if (horseMd) {
    const tb = sectionOf(horseMd, (h) => h.startsWith('trainer'));
    if (tb) {
      trainerBio = tb;
      provenance.push(`horses/${input.horseSlug}/profile.md ## Trainer*`);
    }
  }
  if (!trainerBio) {
    const parts: string[] = [];
    if (input.stableSlug) {
      const stableMd = readMd(path.join(CONTENT_DIR, 'stables', input.stableSlug, 'profile.md'));
      if (stableMd) {
        const sp = sectionOf(stableMd, (h) => h === 'profile');
        if (sp) {
          parts.push(sp);
          provenance.push(`stables/${input.stableSlug}/profile.md ## Profile`);
        }
      }
    }
    for (const person of input.trainerPersonSlugs ?? []) {
      const personMd = readMd(path.join(CONTENT_DIR, 'trainers', `${person}.md`));
      if (personMd) {
        const pp = sectionOf(personMd, (h) => h === 'profile');
        if (pp) {
          parts.push(pp);
          provenance.push(`trainers/${person}.md ## Profile`);
        }
      }
      if (parts.length >= 2) break;
    }
    trainerBio = parts.join('\n\n');
  }

  let racingOutlookAndPedigree = '';
  if (input.sirePedigreeSlug) {
    const pedMd = readMd(path.join(CONTENT_DIR, 'pedigrees', input.sirePedigreeSlug, 'profile.md'));
    if (pedMd) {
      const bc = sectionOf(pedMd, (h) => h === 'breeding career');
      const sig = sectionOf(pedMd, (h) => h.startsWith('significance'));
      racingOutlookAndPedigree = [bc, sig].filter(Boolean).join('\n\n');
      if (racingOutlookAndPedigree)
        provenance.push(`pedigrees/${input.sirePedigreeSlug}/profile.md ## Breeding/Significance`);
    }
  }
  if (!racingOutlookAndPedigree && horseMd) {
    const hp = sectionOf(horseMd, (h) => h === 'pedigree');
    if (hp) {
      racingOutlookAndPedigree = hp;
      provenance.push(`horses/${input.horseSlug}/profile.md ## Pedigree`);
    }
  }

  const who = input.barnName || input.legalName || input.horseSlug;
  const status = input.racingStatus || 'in training';
  const raceExpectation =
    `${who} is ${status}. Members receive regular stable updates; ` +
    `race entries follow as fitness builds, with trial and target plans confirmed by the yard.`;
  provenance.push('template: status + yard-confirmation (draft — founder edits)');

  return { aboutHorse, trainerBio, racingOutlookAndPedigree, raceExpectation, provenance };
}
