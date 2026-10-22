import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { getPoe2Roster } from './path-of-exile-2-service';
import { handlers } from '../mocks/handlers';
import { poe2Roster as poe2RosterFixture } from '../mocks/poe2-roster';

const server = setupServer(...handlers);

describe('Path of Exile 2 service', () => {
  let poe2Roster: typeof poe2RosterFixture;

  beforeEach(() => {
    poe2Roster = structuredClone(poe2RosterFixture);
  });

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should fetch the stored Path of Exile 2 roster from its game endpoint', async () => {
    const roster = await getPoe2Roster(new AbortController().signal);

    expect(roster).toStrictEqual(poe2Roster);
  });

  it('should propagate failures instead of displaying an empty archive', async () => {
    server.use(http.get('*/api/v1/poe2/characters', () => new HttpResponse(null, { status: 503 })));

    await expect(getPoe2Roster()).rejects.toMatchObject({ response: { status: 503 } });
  });

  it('should forward cancellation to the HTTP client', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(getPoe2Roster(controller.signal)).rejects.toMatchObject({ code: 'ERR_CANCELED' });
  });
});
