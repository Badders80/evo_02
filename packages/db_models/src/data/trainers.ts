import type { TrainerProfile } from '../types/knowledge.types';
import { STEPHEN_GRAY_RACING } from './asset-lock';

export const TRAINERS: TrainerProfile[] = [
  {
    slug: 'barbara-kennedy',
    name: 'Barbara Kennedy',
    stableName: 'Barbara Kennedy Racing',
    location: 'Karaka, NZ',
    base: 'Byerley Park',
    philosophy:
      'Boutique racing stable specialising in individualised conditioning, campaign strategy, and hands-on preparation at the renowned Byerley Park training complex in Karaka.',
    highlightTags: ['Boutique Conditioning', 'Byerley Park', 'Karaka'],
  },
  {
    slug: 'lance-osullivan',
    name: "Lance O'Sullivan & Andrew Scott",
    stableName: 'Wexford Stables',
    location: 'Matamata, NZ',
    base: 'Wexford Stables',
    philosophy:
      "A name synonymous with excellence in New Zealand racing history. Wexford Stables continues its legacy under the leadership of Lance O'Sullivan ONZM and Andrew Scott in Matamata.",
    highlightTags: ['Wexford Stables', 'Matamata', 'Premier Stable'],
    bio: "Wexford Stables is a name synonymous with excellence in New Zealand racing history. Founded in 1961 by Hall of Fame trainer Dave O'Sullivan, the legacy continues today under the joint leadership of Lance O'Sullivan ONZM and Andrew Scott.\n\nOperating out of world-class facilities in Matamata, Wexford Stables maintains one of the premier strike rates in Australasian thoroughbred racing. The stable has produced over 600 winners and multiple Group 1 champions.\n\nLance O'Sullivan ONZM — a 12-time Champion Jockey with 2,479 riding wins, including his historic 1989 Japan Cup victory aboard Horlicks — brings unparalleled big-race insight alongside Andrew Scott, who has trained over 1,000 career winners.\n\nSince taking the reins at Wexford Stables, Lance has applied that same horsemanship to training, producing over 600 winners and multiple Group 1 champions, including Waitak (Gr.1 Railway Stakes), Molly Bloom (NZ 1000 Guineas), and Rocket Spade (NZ Derby).",
  },
  {
    slug: STEPHEN_GRAY_RACING.slug,
    name: STEPHEN_GRAY_RACING.name,
    stableName: STEPHEN_GRAY_RACING.stableName,
    location: STEPHEN_GRAY_RACING.location,
    base: STEPHEN_GRAY_RACING.base,
    philosophy:
      'Group 1-winning international trainer with over 825 winners across Singapore and New Zealand, training out of Copper Belt Lodge in Palmerston North.',
    highlightTags: ['Stephen Gray Racing', 'Palmerston North'],
    bio: "Stephen Gray Racing operates from Copper Belt Lodge in Awahuri near Palmerston North — the private training centre Stephen owns in partnership with his father, veteran horseman Kevin Gray.\n\nStephen returned to New Zealand in 2024 following a 24-year international tenure as head of one of Singapore's premier racing stables. As one of the longest-standing license holders at Singapore's Kranji racecourse, Stephen recorded over 825 career wins and 6 local Group 1 victories. His runners have competed at Royal Ascot, Hong Kong, and Dubai.\n\nCareer highlights include two Singapore Derby wins (2007, 2021), the Singapore Gold Cup (2016), the Queen Elizabeth II Cup (2021), and back-to-back Lion City Cup wins with Lim's Cruiser (2017, 2018). His Singapore operation peaked with 60 horses in work, and his longevity in Asia's most competitive jurisdiction is a testament to both his training ability and business acumen.\n\nAt Copper Belt Lodge, Stephen Gray Racing combines world-class facilities with decades of top-tier horsemanship to build a boutique, high-performance operation targeting stakes success across Australasia.",
  },
] as const;

export type TrainerSlug = (typeof TRAINERS)[number]['slug'];
