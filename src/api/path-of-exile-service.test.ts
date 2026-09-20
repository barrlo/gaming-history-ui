import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getPoeRoster } from './path-of-exile-service';
import { handlers } from '../mocks/handlers';
import { poeRoster } from '../mocks/poe-roster';

const server = setupServer(...handlers);

describe('Path of Exile service', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should fetch the stored Path of Exile roster from its game endpoint', async () => {
    const roster = await getPoeRoster(new AbortController().signal);

    expect(roster).toEqual(poeRoster);
  });

  it('should propagate failures instead of displaying an empty archive', async () => {
    server.use(http.get('*/api/v1/poe/characters', () => new HttpResponse(null, { status: 503 })));

    await expect(getPoeRoster()).rejects.toMatchObject({ response: { status: 503 } });
  });
});
