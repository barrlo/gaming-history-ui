import { http, HttpResponse } from 'msw';
import { poeRoster } from './poe-roster';
import { poe2Roster } from './poe2-roster';
import { wowHistories } from './wow-history';
import { wowCurrentScores, wowRoster } from './wow-roster';

export const handlers = [
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
