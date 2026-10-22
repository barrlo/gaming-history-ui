import type { CurrentScore, Roster } from '../api/types';

export const wowRoster = {
  characters: [
    {
      classKey: 'paladin',
      id: 'char-aeloria',
      name: 'Aeloria',
      realm: {
        name: 'Stormrage',
        slug: 'stormrage',
      },
    },
    {
      classKey: 'warrior',
      id: 'char-korren',
      name: 'Korren',
      realm: {
        name: 'Sargeras',
        slug: 'sargeras',
      },
    },
    {
      classKey: 'mage',
      id: 'char-thalren',
      name: 'Thalren',
      realm: {
        name: 'Stormrage',
        slug: 'stormrage',
      },
    },
    {
      classKey: 'druid',
      id: 'char-vaelis',
      name: 'Vaelis',
      realm: {
        name: 'Sargeras',
        slug: 'sargeras',
      },
    },
  ],
  dataMode: 'mock',
  season: {
    endDateEstimated: false,
    endsAt: '2026-10-20T15:00:00Z',
    id: 'demo-season',
    name: 'Demo season',
    region: 'us',
    startsAt: '2026-07-21T15:00:00Z',
  },
} satisfies Roster;

export const wowCurrentScores = [
  {
    baselineScore: 2362,
    baselineWeekIndex: 7,
    characterId: 'char-aeloria',
    dataMode: 'mock',
    fetchedAt: '2026-09-15T12:00:00Z',
    score: 2540,
    season: {
      endDateEstimated: false,
      endsAt: '2026-10-20T15:00:00Z',
      id: 'demo-season',
      name: 'Demo season',
      region: 'us',
      startsAt: '2026-07-21T15:00:00Z',
    },
    weeklyChange: 178,
  },
  {
    baselineScore: null,
    baselineWeekIndex: 7,
    characterId: 'char-korren',
    dataMode: 'mock',
    fetchedAt: '2026-09-15T12:00:00Z',
    score: null,
    season: {
      endDateEstimated: false,
      endsAt: '2026-10-20T15:00:00Z',
      id: 'demo-season',
      name: 'Demo season',
      region: 'us',
      startsAt: '2026-07-21T15:00:00Z',
    },
    weeklyChange: null,
  },
  {
    baselineScore: 2026,
    baselineWeekIndex: 7,
    characterId: 'char-thalren',
    dataMode: 'mock',
    fetchedAt: '2026-09-15T12:00:00Z',
    score: 2112,
    season: {
      endDateEstimated: false,
      endsAt: '2026-10-20T15:00:00Z',
      id: 'demo-season',
      name: 'Demo season',
      region: 'us',
      startsAt: '2026-07-21T15:00:00Z',
    },
    weeklyChange: 86,
  },
  {
    baselineScore: 1764,
    baselineWeekIndex: 7,
    characterId: 'char-vaelis',
    dataMode: 'mock',
    fetchedAt: '2026-09-15T12:00:00Z',
    score: 1764,
    season: {
      endDateEstimated: false,
      endsAt: '2026-10-20T15:00:00Z',
      id: 'demo-season',
      name: 'Demo season',
      region: 'us',
      startsAt: '2026-07-21T15:00:00Z',
    },
    weeklyChange: 0,
  },
] satisfies CurrentScore[];
