// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test/render';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { WorldOfWarcraftRosterPage } from './WorldOfWarcraftRosterPage';
import { createQueryClient } from '../api/query-client';
import { handlers } from '../mocks/handlers';
import { wowRoster as roster } from '../mocks/wow-roster';

const server = setupServer(...handlers);
const renderRoster = () => {
  const client = createQueryClient();
  const view = renderWithRouter(<WorldOfWarcraftRosterPage />, { queryClient: client });

  return { client, ...view };
};

describe('World of Warcraft roster', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should request the roster once on entry and explain weekly change', async () => {
    const rosterRequest = vi.fn(() => HttpResponse.json(roster));
    server.use(http.get('*/api/v1/wow/characters', rosterRequest));
    renderRoster();

    expect(screen.getByText('Loading characters…')).toBeInTheDocument();
    expect(await screen.findByText('2,540')).toBeInTheDocument();
    expect(rosterRequest).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Current scores may be up to 30 minutes old/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  });

  it('should recover a failed roster request with the retry button', async () => {
    const rosterRequest = vi
      .fn(() => HttpResponse.json(roster))
      .mockImplementationOnce(() => new HttpResponse(null, { status: 503 }));
    server.use(http.get('*/api/v1/wow/characters', rosterRequest));
    const user = userEvent.setup();
    renderRoster();

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load characters');
    expect(rosterRequest).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Retry characters' }));

    expect(await screen.findByText('2,540')).toBeInTheDocument();
    expect(rosterRequest).toHaveBeenCalledTimes(2);
  });

  it('should show an empty roster without requesting scores', async () => {
    server.use(http.get('*/api/v1/wow/characters', () => HttpResponse.json({ ...roster, characters: [] })));
    renderRoster();

    expect(await screen.findByRole('heading', { name: 'No characters yet' })).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('should retain character identities between seasons without fetching current scores', async () => {
    const scoreRequest = vi.fn(() => new HttpResponse(null, { status: 503 }));
    server.use(
      http.get('*/api/v1/wow/characters', () => HttpResponse.json({ ...roster, dataMode: 'live', season: null })),
      http.get('*/api/v1/wow/characters/:id/current-score', scoreRequest),
    );
    renderRoster();

    expect(await screen.findByText('Between seasons')).toBeInTheDocument();
    expect(screen.getAllByText('No active season')).toHaveLength(4);
    expect(scoreRequest).not.toHaveBeenCalled();
  });
});
