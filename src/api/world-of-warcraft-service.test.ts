import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { getRoster, getCurrentScore, getHistory } from './world-of-warcraft-service';
import { handlers } from '../mocks/handlers';
import { wowRoster } from '../mocks/wow-roster';

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

  it('should fetch the roster from its game endpoint', async () => {
    const roster = await getRoster(new AbortController().signal);

    expect(roster).toStrictEqual(wowRoster);
  });

  it('should cancel a roster request when its signal is aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(getRoster(controller.signal)).rejects.toMatchObject({ code: 'ERR_CANCELED' });
  });

  it('should propagate roster failures instead of displaying an empty roster', async () => {
    server.use(http.get('*/api/v1/wow/characters', () => new HttpResponse(null, { status: 503 })));

    await expect(getRoster()).rejects.toMatchObject({ response: { status: 503 } });
  });
});
