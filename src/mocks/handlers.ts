import { http, HttpResponse } from 'msw';
import { poeRoster } from './poe-roster';
import { poe2Roster } from './poe2-roster';
import history from '../../contracts/v1/fixtures/populated/char-aeloria.json';
import { wowCurrentScores, wowRoster } from './wow-roster';

export const handlers = [
  http.get('*/api/v1/poe/characters', () => HttpResponse.json(poeRoster)),
  http.get('*/api/v1/poe2/characters', () => HttpResponse.json(poe2Roster)),
  http.get('*/api/v1/wow/characters', () => HttpResponse.json(wowRoster)),
  http.get('*/api/v1/wow/characters/:id/history', ({ params }) =>
    params.id === history.character.id
      ? HttpResponse.json(history)
      : HttpResponse.json({ title: 'Mock character not configured' }, { status: 404 }),
  ),
  http.get('*/api/v1/wow/characters/:id/current-score', ({ params }) => {
    const current = wowCurrentScores.find((score) => score.characterId === params.id);

    return current
      ? HttpResponse.json(current)
      : HttpResponse.json({ title: 'Mock character not configured' }, { status: 404 });
  }),
];
