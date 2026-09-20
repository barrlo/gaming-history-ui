import { http, HttpResponse } from 'msw';
import { poeRoster } from './poe-roster';
import poe2Roster from '../../contracts/v1/fixtures/poe-expansion/poe2-roster.json';
import roster from '../../contracts/v1/fixtures/populated/roster.json';
import history from '../../contracts/v1/fixtures/populated/char-aeloria.json';
import current from '../../contracts/v1/fixtures/populated/char-aeloria-current.json';

// Initial scaffold only: one character's detail; expand scenarios in the vertical slice.
export const handlers = [
  http.get('*/api/v1/poe/characters', () => HttpResponse.json(poeRoster)),
  http.get('*/api/v1/poe2/characters', () => HttpResponse.json(poe2Roster)),
  http.get('*/api/v1/wow/characters', () => HttpResponse.json(roster)),
  http.get('*/api/v1/wow/characters/:id/history', ({ params }) =>
    params.id === history.character.id
      ? HttpResponse.json(history)
      : HttpResponse.json({ title: 'Mock character not configured' }, { status: 404 }),
  ),
  http.get('*/api/v1/wow/characters/:id/current-score', ({ params }) =>
    params.id === current.characterId
      ? HttpResponse.json(current)
      : HttpResponse.json({ title: 'Mock character not configured' }, { status: 404 }),
  ),
];
