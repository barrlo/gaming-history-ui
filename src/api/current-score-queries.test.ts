// @vitest-environment node
import { QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import * as service from './world-of-warcraft-service';
import { currentScoreQueryOptions } from './current-score-queries';
import { wowCurrentScores } from '../mocks/wow-roster';

const server = setupServer();

describe('Current score queries', () => {
  let client: QueryClient, current: (typeof wowCurrentScores)[number];

  beforeEach(() => {
    vi.spyOn(service, 'getCurrentScore');
    client = new QueryClient();
    current = wowCurrentScores[0];
  });

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => {
    client.clear();
    server.resetHandlers();
    vi.restoreAllMocks();
  });

  afterAll(() => server.close());

  it('should not reuse client data instead of revalidating on a new entry', async () => {
    const request = vi.fn(() => HttpResponse.json(current));
    server.use(http.get('*/api/v1/wow/characters/:id/current-score', request));
    await client.fetchQuery(currentScoreQueryOptions('char-aeloria', 'demo-season'));
    await client.fetchQuery(currentScoreQueryOptions('char-aeloria', 'demo-season'));

    expect(request).toHaveBeenCalledTimes(2);
    expect(service.getCurrentScore).toHaveBeenNthCalledWith(1, 'char-aeloria', expect.any(AbortSignal));
    expect(service.getCurrentScore).toHaveBeenNthCalledWith(2, 'char-aeloria', expect.any(AbortSignal));
  });

  it('should reject a response for another character', async () => {
    server.use(http.get('*/api/v1/wow/characters/:id/current-score', () => HttpResponse.json(current)));

    await expect(client.fetchQuery(currentScoreQueryOptions('char-other', 'demo-season'))).rejects.toThrow(
      'does not match',
    );
  });

  it('should cancel an in-flight request without returning its score', async () => {
    const request = vi.fn(() => new Promise<Response>(() => {}));
    server.use(http.get('*/api/v1/wow/characters/:id/current-score', request));
    const pending = client.fetchQuery(currentScoreQueryOptions('char-aeloria', 'demo-season'));
    const settled = Promise.allSettled([pending]);
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    expect(service.getCurrentScore).toHaveBeenNthCalledWith(1, 'char-aeloria', expect.any(AbortSignal));

    await client.cancelQueries({ queryKey: ['wow', 'current-score', 'char-aeloria'] });
    const results = await settled;

    expect(results[0].status).toBe('rejected');
    expect(client.getQueryData(['wow', 'current-score', 'char-aeloria', 'demo-season'])).toBeUndefined();
  });
});
