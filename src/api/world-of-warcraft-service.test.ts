import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { getRoster, getCurrentScore, getHistory } from './world-of-warcraft-service';
import { handlers } from '../mocks/handlers';

const server = setupServer(...handlers);

describe('World of Warcraft service', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should keep current and completed weekly observations separate', async () => {
    const roster = await getRoster();
    const characterId = roster.characters[0].id;
    const [history, current] = await Promise.all([getHistory(characterId), getCurrentScore(characterId)]);

    expect(history.season?.id).toBe(current.season?.id);
    expect(current.score).toBe(2540);
    expect(history.weeklySummary.latestScore).toBe(2362);
    expect(current.weeklyChange).toBe(178);
  });

  it('should not convert an upstream failure into a null success', async () => {
    server.use(
      http.get('*/api/v1/wow/characters/:id/current-score', () =>
        HttpResponse.json({ title: 'Unavailable' }, { status: 503 }),
      ),
    );

    await expect(getCurrentScore('char-aeloria')).rejects.toMatchObject({
      response: { status: 503 },
    });
  });
});
