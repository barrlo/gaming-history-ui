import type { ExileLatest, ExileSnapshot } from '../api/exile-types';

export const poeBuilds: { latest: ExileLatest[]; snapshots: ExileSnapshot[] } = {
  latest: [
    {
      build: {
        ascendancySkills: {
          availability: 'available',
          entries: [
            {
              definitionStatus: 'resolved',
              id: 'asc-example',
              name: 'Example Ascendancy Allocation',
              selectedEffectId: null,
              setIds: [],
              stats: ['Example effect'],
            },
          ],
        },
        character: {
          ascendancy: {
            name: 'Elementalist',
            status: 'known',
          },
          class: 'Witch',
          id: 'f'.repeat(64),
          level: 96,
          name: 'OldFlame',
        },
        definitionVersion: 'fictional-2026-09',
        equipment: {
          availability: 'available',
          entries: [
            {
              baseType: 'Example Robe',
              explicitMods: [
                {
                  description: '+20 to maximum Life',
                },
              ],
              frameTypeId: 'rare',
              identified: true,
              ilvl: 18,
              inventoryId: 'BodyArmour',
              name: 'Ember Ward',
              properties: [
                {
                  displayMode: 0,
                  name: 'Energy Shield',
                  values: [['42', 0]],
                },
              ],
              typeLine: 'Example Robe',
            },
          ],
        },
        game: 'poe',
        league: {
          endAt: '2026-08-28T19:00:00Z',
          id: 'demo-tidefall',
          name: 'Tidefall',
          rules: [],
          startAt: '2026-05-01T19:00:00Z',
        },
        observedAt: '2026-08-28T08:00:00Z',
        passiveSkills: {
          availability: 'available',
          entries: [
            {
              definitionStatus: 'resolved',
              id: 'passive-example',
              name: 'Example Passive Allocation',
              selectedEffectId: null,
              setIds: ['default'],
              stats: ['+10 to Intelligence'],
            },
          ],
        },
        skills: {
          availability: 'available',
          entries: [
            {
              id: 'group-1',
              skills: [
                {
                  level: 3,
                  name: 'Example Skill',
                  quality: 0,
                },
              ],
              supports: [
                {
                  level: 3,
                  name: 'Example Support',
                  quality: 0,
                },
              ],
            },
          ],
        },
      },
      refresh: {
        nextAllowedAt: null,
        operationId: null,
        status: 'archived',
      },
      tracking: {
        firstSeenAt: '2026-05-01T21:00:00Z',
        reason: 'leagueEnded',
        status: 'archived',
      },
    },
    {
      build: {
        ascendancySkills: {
          availability: 'notApplicable',
          entries: [],
        },
        character: {
          ascendancy: {
            name: null,
            status: 'none',
          },
          class: 'Witch',
          id: 'a'.repeat(64),
          level: 18,
          name: 'Ashwarden',
        },
        definitionVersion: null,
        equipment: {
          availability: 'available',
          entries: [
            {
              baseType: 'Example Robe',
              explicitMods: [
                {
                  description: '+20 to maximum Life',
                },
              ],
              frameTypeId: 'rare',
              identified: true,
              ilvl: 18,
              inventoryId: 'BodyArmour',
              name: 'Ember Ward',
              properties: [
                {
                  displayMode: 0,
                  name: 'Energy Shield',
                  values: [['42', 0]],
                },
              ],
              typeLine: 'Example Robe',
            },
          ],
        },
        game: 'poe',
        league: {
          endAt: null,
          id: 'demo-emberfall',
          name: 'Emberfall',
          rules: [],
          startAt: '2026-09-04T19:00:00Z',
        },
        observedAt: '2026-09-20T08:00:00Z',
        passiveSkills: {
          availability: 'unavailable',
          entries: [],
        },
        skills: {
          availability: 'available',
          entries: [
            {
              id: 'group-1',
              skills: [
                {
                  level: 3,
                  name: 'Example Skill',
                  quality: 0,
                },
              ],
              supports: [
                {
                  level: 3,
                  name: 'Example Support',
                  quality: 0,
                },
              ],
            },
          ],
        },
      },
      refresh: {
        nextAllowedAt: null,
        operationId: null,
        status: 'available',
      },
      tracking: {
        firstSeenAt: '2026-09-18T21:00:00Z',
        reason: null,
        status: 'active',
      },
    },
    {
      build: {
        ascendancySkills: {
          availability: 'available',
          entries: [
            {
              definitionStatus: 'resolved',
              id: 'asc-example',
              name: 'Example Ascendancy Allocation',
              selectedEffectId: null,
              setIds: [],
              stats: ['Example effect'],
            },
          ],
        },
        character: {
          ascendancy: {
            name: 'Occultist',
            status: 'known',
          },
          class: 'Witch',
          id: 'e'.repeat(64),
          level: 75,
          name: 'IronAsh',
        },
        definitionVersion: 'fictional-2026-09',
        equipment: {
          availability: 'available',
          entries: [
            {
              baseType: 'Example Robe',
              explicitMods: [
                {
                  description: '+20 to maximum Life',
                },
              ],
              frameTypeId: 'rare',
              identified: true,
              ilvl: 18,
              inventoryId: 'BodyArmour',
              name: 'Ember Ward',
              properties: [
                {
                  displayMode: 0,
                  name: 'Energy Shield',
                  values: [['42', 0]],
                },
              ],
              typeLine: 'Example Robe',
            },
          ],
        },
        game: 'poe',
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
        passiveSkills: {
          availability: 'partial',
          entries: [
            {
              definitionStatus: 'unavailable',
              id: 'unresolved-example',
              name: null,
              selectedEffectId: null,
              setIds: ['default'],
              stats: [],
            },
          ],
        },
        skills: {
          availability: 'partial',
          entries: [
            {
              id: 'group-1',
              skills: [
                {
                  level: 3,
                  name: 'Example Skill',
                  quality: null,
                },
              ],
              supports: [
                {
                  level: 3,
                  name: 'Example Support',
                  quality: 0,
                },
              ],
            },
          ],
        },
      },
      refresh: {
        nextAllowedAt: null,
        operationId: null,
        status: 'available',
      },
      tracking: {
        firstSeenAt: '2026-09-18T21:00:00Z',
        reason: null,
        status: 'active',
      },
    },
    {
      build: {
        ascendancySkills: {
          availability: 'available',
          entries: [
            {
              definitionStatus: 'resolved',
              id: 'asc-example',
              name: 'Example Ascendancy Allocation',
              selectedEffectId: null,
              setIds: [],
              stats: ['Example effect'],
            },
          ],
        },
        character: {
          ascendancy: {
            name: 'Necromancer',
            status: 'known',
          },
          class: 'Witch',
          id: 'c'.repeat(64),
          level: 93,
          name: 'Emberwitch',
        },
        definitionVersion: 'fictional-2026-09',
        equipment: {
          availability: 'available',
          entries: [
            {
              baseType: 'Example Robe',
              explicitMods: [
                {
                  description: '+20 to maximum Life',
                },
              ],
              frameTypeId: 'rare',
              identified: true,
              ilvl: 18,
              inventoryId: 'BodyArmour',
              name: 'Ember Ward',
              properties: [
                {
                  displayMode: 0,
                  name: 'Energy Shield',
                  values: [['42', 0]],
                },
              ],
              typeLine: 'Example Robe',
            },
          ],
        },
        game: 'poe',
        league: {
          endAt: null,
          id: 'demo-emberfall',
          name: 'Emberfall',
          rules: [],
          startAt: '2026-09-04T19:00:00Z',
        },
        observedAt: '2026-09-20T08:00:00Z',
        passiveSkills: {
          availability: 'available',
          entries: [
            {
              definitionStatus: 'resolved',
              id: 'passive-example',
              name: 'Example Passive Allocation',
              selectedEffectId: null,
              setIds: ['default'],
              stats: ['+10 to Intelligence'],
            },
          ],
        },
        skills: {
          availability: 'available',
          entries: [
            {
              id: 'group-1',
              skills: [
                {
                  level: 3,
                  name: 'Example Skill',
                  quality: 0,
                },
              ],
              supports: [
                {
                  level: 3,
                  name: 'Example Support',
                  quality: 0,
                },
              ],
            },
          ],
        },
      },
      refresh: {
        nextAllowedAt: null,
        operationId: null,
        status: 'available',
      },
      tracking: {
        firstSeenAt: '2026-09-18T21:00:00Z',
        reason: null,
        status: 'active',
      },
    },
  ],
  snapshots: [
    {
      build: {
        ascendancySkills: {
          availability: 'available',
          entries: [
            {
              definitionStatus: 'resolved',
              id: 'asc-example',
              name: 'Example Ascendancy Allocation',
              selectedEffectId: null,
              setIds: [],
              stats: ['Example effect'],
            },
          ],
        },
        character: {
          ascendancy: {
            name: 'Elementalist',
            status: 'known',
          },
          class: 'Witch',
          id: 'f'.repeat(64),
          level: 86,
          name: 'OldFlame',
        },
        definitionVersion: 'fictional-2026-09',
        equipment: {
          availability: 'available',
          entries: [
            {
              baseType: 'Example Robe',
              explicitMods: [
                {
                  description: '+20 to maximum Life',
                },
              ],
              frameTypeId: 'rare',
              identified: true,
              ilvl: 18,
              inventoryId: 'BodyArmour',
              name: 'Ember Ward',
              properties: [
                {
                  displayMode: 0,
                  name: 'Energy Shield',
                  values: [['42', 0]],
                },
              ],
              typeLine: 'Example Robe',
            },
          ],
        },
        game: 'poe',
        league: {
          endAt: '2026-08-28T19:00:00Z',
          id: 'demo-tidefall',
          name: 'Tidefall',
          rules: [],
          startAt: '2026-05-01T19:00:00Z',
        },
        observedAt: '2026-08-27T09:00:00Z',
        passiveSkills: {
          availability: 'available',
          entries: [
            {
              definitionStatus: 'resolved',
              id: 'passive-example',
              name: 'Example Passive Allocation',
              selectedEffectId: null,
              setIds: ['default'],
              stats: ['+10 to Intelligence'],
            },
          ],
        },
        skills: {
          availability: 'available',
          entries: [
            {
              id: 'group-1',
              skills: [
                {
                  level: 3,
                  name: 'Example Skill',
                  quality: 0,
                },
              ],
              supports: [
                {
                  level: 3,
                  name: 'Example Support',
                  quality: 0,
                },
              ],
            },
          ],
        },
      },
      snapshot: {
        historyDate: '2026-08-27',
        id: 'poe-f-2026-08-27',
        league: {
          endAt: '2026-08-28T19:00:00Z',
          id: 'demo-tidefall',
          name: 'Tidefall',
          rules: [],
          startAt: '2026-05-01T19:00:00Z',
        },
        level: 86,
        observedAt: '2026-08-27T09:00:00Z',
        scheduledAt: '2026-08-27T08:00:00Z',
      },
    },
    {
      build: {
        ascendancySkills: {
          availability: 'notApplicable',
          entries: [],
        },
        character: {
          ascendancy: {
            name: null,
            status: 'none',
          },
          class: 'Witch',
          id: 'a'.repeat(64),
          level: 8,
          name: 'Ashwarden',
        },
        definitionVersion: null,
        equipment: {
          availability: 'available',
          entries: [
            {
              baseType: 'Example Robe',
              explicitMods: [
                {
                  description: '+20 to maximum Life',
                },
              ],
              frameTypeId: 'rare',
              identified: true,
              ilvl: 18,
              inventoryId: 'BodyArmour',
              name: 'Ember Ward',
              properties: [
                {
                  displayMode: 0,
                  name: 'Energy Shield',
                  values: [['42', 0]],
                },
              ],
              typeLine: 'Example Robe',
            },
          ],
        },
        game: 'poe',
        league: {
          endAt: null,
          id: 'demo-emberfall',
          name: 'Emberfall',
          rules: [],
          startAt: '2026-09-04T19:00:00Z',
        },
        observedAt: '2026-09-19T09:00:00Z',
        passiveSkills: {
          availability: 'unavailable',
          entries: [],
        },
        skills: {
          availability: 'available',
          entries: [
            {
              id: 'group-1',
              skills: [
                {
                  level: 3,
                  name: 'Example Skill',
                  quality: 0,
                },
              ],
              supports: [
                {
                  level: 3,
                  name: 'Example Support',
                  quality: 0,
                },
              ],
            },
          ],
        },
      },
      snapshot: {
        historyDate: '2026-09-19',
        id: 'poe-a-2026-09-19',
        league: {
          endAt: null,
          id: 'demo-emberfall',
          name: 'Emberfall',
          rules: [],
          startAt: '2026-09-04T19:00:00Z',
        },
        level: 8,
        observedAt: '2026-09-19T09:00:00Z',
        scheduledAt: '2026-09-19T08:00:00Z',
      },
    },
    {
      build: {
        ascendancySkills: {
          availability: 'available',
          entries: [
            {
              definitionStatus: 'resolved',
              id: 'asc-example',
              name: 'Example Ascendancy Allocation',
              selectedEffectId: null,
              setIds: [],
              stats: ['Example effect'],
            },
          ],
        },
        character: {
          ascendancy: {
            name: 'Necromancer',
            status: 'known',
          },
          class: 'Witch',
          id: 'c'.repeat(64),
          level: 83,
          name: 'Emberwitch',
        },
        definitionVersion: 'fictional-2026-09',
        equipment: {
          availability: 'available',
          entries: [
            {
              baseType: 'Example Robe',
              explicitMods: [
                {
                  description: '+20 to maximum Life',
                },
              ],
              frameTypeId: 'rare',
              identified: true,
              ilvl: 18,
              inventoryId: 'BodyArmour',
              name: 'Ember Ward',
              properties: [
                {
                  displayMode: 0,
                  name: 'Energy Shield',
                  values: [['42', 0]],
                },
              ],
              typeLine: 'Example Robe',
            },
          ],
        },
        game: 'poe',
        league: {
          endAt: null,
          id: 'demo-emberfall',
          name: 'Emberfall',
          rules: [],
          startAt: '2026-09-04T19:00:00Z',
        },
        observedAt: '2026-09-19T09:00:00Z',
        passiveSkills: {
          availability: 'available',
          entries: [
            {
              definitionStatus: 'resolved',
              id: 'passive-example',
              name: 'Example Passive Allocation',
              selectedEffectId: null,
              setIds: ['default'],
              stats: ['+10 to Intelligence'],
            },
          ],
        },
        skills: {
          availability: 'available',
          entries: [
            {
              id: 'group-1',
              skills: [
                {
                  level: 3,
                  name: 'Example Skill',
                  quality: 0,
                },
              ],
              supports: [
                {
                  level: 3,
                  name: 'Example Support',
                  quality: 0,
                },
              ],
            },
          ],
        },
      },
      snapshot: {
        historyDate: '2026-09-19',
        id: 'poe-c-2026-09-19',
        league: {
          endAt: null,
          id: 'demo-emberfall',
          name: 'Emberfall',
          rules: [],
          startAt: '2026-09-04T19:00:00Z',
        },
        level: 83,
        observedAt: '2026-09-19T09:00:00Z',
        scheduledAt: '2026-09-19T08:00:00Z',
      },
    },
    {
      build: {
        ascendancySkills: {
          availability: 'notApplicable',
          entries: [],
        },
        character: {
          ascendancy: {
            name: null,
            status: 'none',
          },
          class: 'Witch',
          id: 'c'.repeat(64),
          level: 73,
          name: 'Emberwitch',
        },
        definitionVersion: 'fictional-2026-09',
        equipment: {
          availability: 'available',
          entries: [],
        },
        game: 'poe',
        league: {
          endAt: null,
          id: 'demo-emberfall',
          name: 'Emberfall',
          rules: [],
          startAt: '2026-09-04T19:00:00Z',
        },
        observedAt: '2026-09-18T09:00:00Z',
        passiveSkills: {
          availability: 'available',
          entries: [],
        },
        skills: {
          availability: 'available',
          entries: [
            {
              id: 'group-1',
              skills: [
                {
                  level: 3,
                  name: 'Example Skill',
                  quality: 0,
                },
              ],
              supports: [
                {
                  level: 3,
                  name: 'Example Support',
                  quality: 0,
                },
              ],
            },
          ],
        },
      },
      snapshot: {
        historyDate: '2026-09-18',
        id: 'poe-c-2026-09-18',
        league: {
          endAt: null,
          id: 'demo-emberfall',
          name: 'Emberfall',
          rules: [],
          startAt: '2026-09-04T19:00:00Z',
        },
        level: 73,
        observedAt: '2026-09-18T09:00:00Z',
        scheduledAt: '2026-09-18T08:00:00Z',
      },
    },
  ],
};
