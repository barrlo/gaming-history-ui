import { QueryClient } from '@tanstack/react-query';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { currentScoreQueryOptions } from './current-score-queries';
import current from '../../contracts/v1/fixtures/populated/char-aeloria-current.json';

const server = setupServer();

describe('Current score queries', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should cap concurrent requests at three and release slots after failures', async () => {
    let active = 0;
    let maximum = 0;
    server.use(
      http.get('*/api/v1/wow/characters/:id/current-score', async ({ params }) => {
        active += 1;
        maximum = Math.max(maximum, active);
        await delay(30);
        active -= 1;

        return params.id === 'character-0'
          ? new HttpResponse(null, { status: 503 })
          : HttpResponse.json({ ...current, characterId: params.id });
      }),
    );
    const client = new QueryClient();
    const results = await Promise.allSettled(
      Array.from({ length: 7 }, (_, index) =>
        client.fetchQuery(currentScoreQueryOptions(`character-${index}`, 'demo-season')),
      ),
    );
    client.clear();

    expect(maximum).toBe(3);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(6);
  });

  it('should not reuse client data instead of revalidating on a new entry', async () => {
    const request = vi.fn();
    server.use(
      http.get('*/api/v1/wow/characters/:id/current-score', () => {
        request();

        return HttpResponse.json(current);
      }),
    );
    const client = new QueryClient();
    await client.fetchQuery(currentScoreQueryOptions('char-aeloria', 'demo-season'));
    await client.fetchQuery(currentScoreQueryOptions('char-aeloria', 'demo-season'));
    client.clear();

    expect(request).toHaveBeenCalledTimes(2);
  });

  it('should reject a response for another character', async () => {
    server.use(http.get('*/api/v1/wow/characters/:id/current-score', () => HttpResponse.json(current)));
    const client = new QueryClient();

    await expect(client.fetchQuery(currentScoreQueryOptions('char-other', 'demo-season'))).rejects.toThrow(
      'does not match',
    );

    client.clear();
  });

  it('should cancel queued requests without fetching or consuming a later slot', async () => {
    const requested: string[] = [];
    server.use(
      http.get('*/api/v1/wow/characters/:id/current-score', async ({ params }) => {
        requested.push(String(params.id));
        await delay(40);

        return HttpResponse.json({ ...current, characterId: params.id });
      }),
    );
    const client = new QueryClient();
    const pending = Array.from({ length: 4 }, (_, index) =>
      client.fetchQuery(currentScoreQueryOptions(`character-${index}`, 'demo-season')),
    );
    const settled = Promise.allSettled(pending);
    await client.cancelQueries({ queryKey: ['wow', 'current-score', 'character-3'] });
    await settled;
    await client.fetchQuery(currentScoreQueryOptions('character-next', 'demo-season'));
    client.clear();

    expect(requested).not.toContain('character-3');
    expect(requested).toContain('character-next');
  });
});
