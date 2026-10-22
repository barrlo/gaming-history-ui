import type { ExileRoster } from '../api/exile-types';

export const poeRoster: ExileRoster = {
  game: 'poe',
  groups: [
    {
      characters: [
        {
          buildAvailable: true,
          character: {
            ascendancy: { name: 'Elementalist', status: 'known' },
            class: 'Witch',
            id: 'a'.repeat(64),
            level: 91,
            name: 'Ashwarden',
          },
          league: { endAt: null, id: 'emberfall', name: 'Emberfall', rules: [], startAt: '2026-09-11T19:00:00Z' },
          observedAt: '2026-09-20T08:00:00Z',
          tracking: { firstSeenAt: '2026-09-11T20:00:00Z', reason: null, status: 'active' },
        },
        {
          buildAvailable: true,
          character: {
            ascendancy: { name: 'Juggernaut', status: 'known' },
            class: 'Marauder',
            id: 'b'.repeat(64),
            level: 67,
            name: 'Stonewake',
          },
          league: {
            endAt: null,
            id: 'hc-ssf-emberfall',
            name: 'HC SSF Emberfall',
            rules: [
              { id: 'hardcore', name: 'Hardcore' },
              { id: 'ssf', name: 'SSF' },
            ],
            startAt: '2026-09-11T19:00:00Z',
          },
          observedAt: '2026-09-20T08:00:00Z',
          tracking: { firstSeenAt: '2026-09-16T20:00:00Z', reason: null, status: 'active' },
        },
      ],
      id: 'emberfall-family',
      name: 'Demo league · Emberfall',
      startAt: '2026-09-11T19:00:00Z',
    },
    {
      characters: [
        {
          buildAvailable: true,
          character: {
            ascendancy: { name: 'Deadeye', status: 'known' },
            class: 'Ranger',
            id: 'c'.repeat(64),
            level: 94,
            name: 'Winterglass',
          },
          league: {
            endAt: '2026-08-31T19:00:00Z',
            id: 'firstlight',
            name: 'Firstlight',
            rules: [],
            startAt: '2026-05-08T19:00:00Z',
          },
          observedAt: '2026-08-31T08:00:00Z',
          tracking: { firstSeenAt: '2026-05-08T20:00:00Z', reason: 'leagueEnded', status: 'archived' },
        },
      ],
      id: 'firstlight-family',
      name: 'Demo league · Firstlight',
      startAt: '2026-05-08T19:00:00Z',
    },
  ],
};
