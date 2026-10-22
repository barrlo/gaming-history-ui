import { QueryClient } from '@tanstack/react-query';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { currentScoreQueryOptions } from './current-score-queries';
import { wowCurrentScores } from '../mocks/wow-roster';

const current = wowCurrentScores[0];

const server = setupServer();

describe('Current score queries', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should not reuse client data instead of revalidating on a new entry', async () => {
    const request = vi.fn(() => HttpResponse.json(current));
    server.use(http.get('*/api/v1/wow/characters/:id/current-score', request));
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

  it('should cancel an in-flight request without returning its score', async () => {
    const request = vi.fn(async () => {
      await delay(100);

      return HttpResponse.json(current);
    });
    server.use(http.get('*/api/v1/wow/characters/:id/current-score', request));
    const client = new QueryClient();
    const pending = client.fetchQuery(currentScoreQueryOptions('char-aeloria', 'demo-season'));
    const settled = Promise.allSettled([pending]);
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    await client.cancelQueries({ queryKey: ['wow', 'current-score', 'char-aeloria'] });
    const results = await settled;

    expect(results[0].status).toBe('rejected');
    expect(client.getQueryData(['wow', 'current-score', 'char-aeloria', 'demo-season'])).toBeUndefined();

    client.clear();
  });
});
