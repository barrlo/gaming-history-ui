import { http, HttpResponse } from 'msw';
import { poeBuilds } from './poe-builds';
import { poe2Builds } from './poe2-builds';
import { poeRoster } from './poe-roster';
import { poe2Roster } from './poe2-roster';
import { wowHistories } from './wow-history';
import { wowCurrentScores, wowRoster } from './wow-roster';

const buildHandlers = (game: 'poe' | 'poe2') => {
  const fixtures = game === 'poe' ? poeBuilds : poe2Builds;

  return [
    http.get(`*/api/v1/${game}/characters/:characterId/build`, ({ params }) => {
      const latest = fixtures.latest.find((entry) => entry.build.character.id === params.characterId);

      return latest ? HttpResponse.json(latest) : HttpResponse.json({ title: 'Build unavailable' }, { status: 503 });
    }),
    http.get(`*/api/v1/${game}/characters/:characterId/snapshots`, ({ params, request }) => {
      const records = fixtures.snapshots
        .filter((entry) => entry.build.character.id === params.characterId)
        .sort((first, second) => second.snapshot.scheduledAt.localeCompare(first.snapshot.scheduledAt));
      const cursor = new URL(request.url).searchParams.get('cursor');
      const offset = cursor ? records.findIndex((entry) => entry.snapshot.id === cursor) + 1 : 0;
      const page = records.slice(offset, offset + 1);

      return HttpResponse.json({
        nextCursor: offset + 1 < records.length ? page[0].snapshot.id : null,
        snapshots: page.map((entry) => entry.snapshot),
      });
    }),
    http.get(`*/api/v1/${game}/characters/:characterId/snapshots/:snapshotId`, ({ params }) => {
      const snapshot = fixtures.snapshots.find(
        (entry) => entry.build.character.id === params.characterId && entry.snapshot.id === params.snapshotId,
      );

      return snapshot
        ? HttpResponse.json(snapshot)
        : HttpResponse.json({ title: 'Snapshot unavailable' }, { status: 404 });
    }),
  ];
};

export const handlers = [
  ...buildHandlers('poe'),
  ...buildHandlers('poe2'),
  http.get('*/api/v1/poe/characters', () => HttpResponse.json(poeRoster)),
  http.get('*/api/v1/poe2/characters', () => HttpResponse.json(poe2Roster)),
  http.get('*/api/v1/wow/characters', () => HttpResponse.json(wowRoster)),
  http.get('*/api/v1/wow/characters/:id/history', ({ params }) => {
    const history = wowHistories.find((entry) => entry.character.id === params.id);

    return history ? HttpResponse.json(history) : HttpResponse.json({ title: 'Character not found' }, { status: 404 });
  }),
  http.get('*/api/v1/wow/characters/:id/current-score', ({ params }) => {
    const current = wowCurrentScores.find((score) => score.characterId === params.id);

    return current
      ? HttpResponse.json(current)
      : HttpResponse.json({ title: 'Mock character not configured' }, { status: 404 });
  }),
];
