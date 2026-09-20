import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { getPoe2Roster } from './path-of-exile-2-service';
import roster from '../../contracts/v1/fixtures/poe-expansion/poe2-roster.json';

const server = setupServer(http.get('*/api/v1/poe2/characters', () => HttpResponse.json(roster)));

describe('Path of Exile 2 service', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should fetch the latest collected PoE2 roster without a platform filter', async () => {
    let requestUrl: URL | undefined;
    server.use(
      http.get('*/api/v1/poe2/characters', ({ request }) => {
        requestUrl = new URL(request.url);

        return HttpResponse.json(roster);
      }),
    );
    const response = await getPoe2Roster();

    expect(response).toEqual(roster);
    expect(response.game).toBe('poe2');
    expect(requestUrl?.search).toBe('');
  });

  it('should preserve roster failures for the page retry state', async () => {
    server.use(http.get('*/api/v1/poe2/characters', () => HttpResponse.json({}, { status: 503 })));

    await expect(getPoe2Roster()).rejects.toMatchObject({ response: { status: 503 } });
  });

  it('should forward cancellation to the HTTP client', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(getPoe2Roster(controller.signal)).rejects.toMatchObject({ code: 'ERR_CANCELED' });
  });
});
