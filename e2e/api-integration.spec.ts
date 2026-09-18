import { test, expect } from '@playwright/test';
import type { Roster, History, CurrentScore } from '../src/api/types';

test('real local API supports the pinned roster/history/current contract through Vite proxy', async ({ request }) => {
  // eslint-disable-next-line playwright/no-skipped-test -- Opt-in integration check requires the separately running API.
  test.skip(process.env.INTEGRATION_API !== '1', 'Start the local API and run npm run test:integration.');
  const response = await request.get('/api/v1/wow/characters');

  expect(response.ok()).toBeTruthy();

  const roster: Roster = await response.json();
  const character = roster.characters.find((candidate) => candidate.id === 'char-aeloria');

  expect(character).toBeDefined();

  const [historyResponse, currentResponse] = await Promise.all([
    request.get(`/api/v1/wow/characters/${character!.id}/history?season=current`),
    request.get(`/api/v1/wow/characters/${character!.id}/current-score?season=current`),
  ]);

  expect(historyResponse.ok()).toBeTruthy();
  expect(currentResponse.ok()).toBeTruthy();

  const history: History = await historyResponse.json();
  const current: CurrentScore = await currentResponse.json();

  expect(current.season?.id).toBe(history.season?.id);
  expect(current.score).toBe(2540);
  expect(history.weeklySummary.latestScore).toBe(2362);
  expect(current.weeklyChange).toBe(178);
});
