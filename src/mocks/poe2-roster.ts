import type { ExileRoster } from '../api/exile-types';

export const poe2Roster: ExileRoster = {
  game: 'poe2',
  leagues: [
    {
      characters: [
        {
          buildAvailable: true,
          character: {
            ascendancy: {
              name: 'Stormweaver',
              status: 'known',
            },
            class: 'Sorceress',
            id: 'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
            level: 93,
            name: 'Stormwarden',
          },
          league: {
            endAt: null,
            id: 'demo-emberfall',
            name: 'Emberfall',
            rules: [],
            startAt: '2026-09-04T19:00:00Z',
          },
          observedAt: '2026-09-20T08:00:00Z',
          tracking: {
            firstSeenAt: '2026-09-18T21:00:00Z',
            reason: null,
            status: 'active',
          },
        },
        {
          buildAvailable: true,
          character: {
            ascendancy: {
              name: 'Infernalist',
              status: 'known',
            },
            class: 'Witch',
            id: 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            level: 75,
            name: 'IronAsh',
          },
          league: {
            endAt: null,
            id: 'demo-emberfall-hc',
            name: 'Hardcore Emberfall',
            rules: [
              {
                id: 'hardcore',
                name: 'Hardcore',
              },
            ],
            startAt: '2026-09-04T19:00:00Z',
          },
          observedAt: '2026-09-20T08:00:00Z',
          tracking: {
            firstSeenAt: '2026-09-18T21:00:00Z',
            reason: null,
            status: 'active',
          },
        },
        {
          buildAvailable: true,
          character: {
            ascendancy: {
              name: null,
              status: 'none',
            },
            class: 'Witch',
            id: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            level: 18,
            name: 'Ashwarden',
          },
          league: {
            endAt: null,
            id: 'demo-emberfall',
            name: 'Emberfall',
            rules: [],
            startAt: '2026-09-04T19:00:00Z',
          },
          observedAt: '2026-09-20T08:00:00Z',
          tracking: {
            firstSeenAt: '2026-09-18T21:00:00Z',
            reason: null,
            status: 'active',
          },
        },
      ],
      id: 'demo-family',
      name: 'Emberfall',
      startAt: '2026-09-04T19:00:00Z',
    },
    {
      characters: [
        {
          buildAvailable: true,
          character: {
            ascendancy: {
              name: 'Chronomancer',
              status: 'known',
            },
            class: 'Sorceress',
            id: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            level: 96,
            name: 'OldFlame',
          },
          league: {
            endAt: '2026-08-28T19:00:00Z',
            id: 'demo-tidefall',
            name: 'Tidefall',
            rules: [],
            startAt: '2026-05-01T19:00:00Z',
          },
          observedAt: '2026-08-28T08:00:00Z',
          tracking: {
            firstSeenAt: '2026-05-01T21:00:00Z',
            reason: 'leagueEnded',
            status: 'archived',
          },
        },
      ],
      id: 'tidefall-family',
      name: 'Tidefall',
      startAt: '2026-05-01T19:00:00Z',
    },
    {
      characters: [
        {
          buildAvailable: false,
          character: {
            ascendancy: {
              name: null,
              status: 'none',
            },
            class: 'Witch',
            id: '1111111111111111111111111111111111111111111111111111111111111111',
            level: 8,
            name: 'FirstSteps',
          },
          league: {
            endAt: null,
            id: 'demo-unknown',
            name: 'Uncharted',
            rules: [],
            startAt: null,
          },
          observedAt: '2026-09-20T08:00:00Z',
          tracking: {
            firstSeenAt: '2026-09-18T21:00:00Z',
            reason: 'missing',
            status: 'archived',
          },
        },
      ],
      id: 'unknown-family',
      name: 'Uncharted',
      startAt: null,
    },
  ],
};
