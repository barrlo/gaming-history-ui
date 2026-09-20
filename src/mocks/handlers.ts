import { http, HttpResponse } from 'msw';
import roster from '../../contracts/v1/fixtures/populated/roster.json';
import history from '../../contracts/v1/fixtures/populated/char-aeloria.json';
import aeloria from '../../contracts/v1/fixtures/populated/char-aeloria-current.json';
import korren from '../../contracts/v1/fixtures/populated/char-korren-current.json';
import thalren from '../../contracts/v1/fixtures/populated/char-thalren-current.json';
import vaelis from '../../contracts/v1/fixtures/populated/char-vaelis-current.json';

const currentScores = [aeloria, korren, thalren, vaelis];
export const handlers = [
  http.get('*/api/v1/wow/characters', () => HttpResponse.json(roster)),
  http.get('*/api/v1/wow/characters/:id/history', ({ params }) =>
    params.id === history.character.id
      ? HttpResponse.json(history)
      : HttpResponse.json({ title: 'Mock character not configured' }, { status: 404 }),
  ),
  http.get('*/api/v1/wow/characters/:id/current-score', ({ params }) => {
    const current = currentScores.find((score) => score.characterId === params.id);

    return current
      ? HttpResponse.json(current)
      : HttpResponse.json({ title: 'Mock character not configured' }, { status: 404 });
  }),
];
