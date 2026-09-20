// @vitest-environment jsdom
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MantineProvider } from '@mantine/core';
import { WorldOfWarcraftRosterPage } from './WorldOfWarcraftRosterPage';
import { createQueryClient } from '../api/query-client';
import { handlers } from '../mocks/handlers';
import { cssVariablesResolver, theme } from '../theme';
import roster from '../../contracts/v1/fixtures/populated/roster.json';
import current from '../../contracts/v1/fixtures/populated/char-aeloria-current.json';
import '../test/setup';

const server = setupServer(...handlers);
const renderRoster = () => {
  const client = createQueryClient();
  const router = createMemoryRouter([{ element: <WorldOfWarcraftRosterPage />, path: '/' }]);
  const view = render(
    <MantineProvider cssVariablesResolver={cssVariablesResolver} env="test" theme={theme}>
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MantineProvider>,
  );

  return { client, ...view };
};

describe('World of Warcraft roster', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should display current scores in descending order, separate null from zero, and explain weekly change', async () => {
    renderRoster();

    expect(screen.getByText('Loading characters…')).toBeInTheDocument();
    expect(await screen.findByText('2,540')).toBeInTheDocument();
    expect(await screen.findByText('2,112')).toBeInTheDocument();
    expect(await screen.findByText('1,764')).toBeInTheDocument();
    expect(screen.getAllByRole('article').map((element) => element.getAttribute('aria-label'))).toEqual([
      'Aeloria',
      'Thalren',
      'Vaelis',
      'Korren',
    ]);
    expect(within(screen.getByRole('article', { name: 'Korren' })).getByText('No score yet')).toBeInTheDocument();
    expect(within(screen.getByRole('article', { name: 'Vaelis' })).getByText('0')).toBeInTheDocument();
    expect(screen.getByText('+178')).toBeInTheDocument();
    expect(screen.getByText(/Current scores may be up to 30 minutes old/)).toBeInTheDocument();
    expect(screen.getByText(/Demo data/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('link', { name: /Aeloria/ })).not.toBeInTheDocument();
  });

  it('should recover a failed roster request with the retry button', async () => {
    server.use(http.get('*/api/v1/wow/characters', () => new HttpResponse(null, { status: 503 })));
    const user = userEvent.setup();
    renderRoster();

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load characters');

    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: 'Retry characters' }));

    expect(await screen.findByText('2,540')).toBeInTheDocument();
  });

  it('should retry only a failed character while preserving other scores', async () => {
    const attempts: string[] = [];
    let fail = true;
    server.use(
      http.get('*/api/v1/wow/characters/:id/current-score', ({ params }) => {
        attempts.push(String(params.id));

        if (params.id === current.characterId) {
          return fail ? new HttpResponse(null, { status: 503 }) : HttpResponse.json(current);
        }
      }),
    );
    const user = userEvent.setup();
    renderRoster();
    const retry = await screen.findByRole('button', { name: 'Retry score for Aeloria' });

    expect(await screen.findByText('2,112')).toBeInTheDocument();
    expect(within(screen.getByRole('article', { name: 'Aeloria' })).getByText('Unavailable')).toBeInTheDocument();

    const beforeRetry = attempts.length;
    fail = false;
    await user.click(retry);

    expect(await screen.findByText('2,540')).toBeInTheDocument();
    expect(attempts.slice(beforeRetry)).toEqual(['char-aeloria']);
  });

  it('should show identities while their scores are loading', async () => {
    server.use(
      http.get('*/api/v1/wow/characters/:id/current-score', async ({ params }) => {
        await delay(100);

        return HttpResponse.json({ ...current, characterId: params.id });
      }),
    );
    renderRoster();

    expect(await screen.findByRole('article', { name: 'Aeloria' })).toHaveTextContent('Loading score…');

    await waitFor(() => expect(screen.getAllByText('2,540')).toHaveLength(4));
  });

  it('should show an empty roster without requesting scores', async () => {
    server.use(http.get('*/api/v1/wow/characters', () => HttpResponse.json({ ...roster, characters: [] })));
    renderRoster();

    expect(await screen.findByRole('heading', { name: 'No characters yet' })).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('should retain character identities between seasons without fetching current scores', async () => {
    const scoreRequest = vi.fn();
    server.use(
      http.get('*/api/v1/wow/characters', () => HttpResponse.json({ ...roster, dataMode: 'live', season: null })),
      http.get('*/api/v1/wow/characters/:id/current-score', () => {
        scoreRequest();
      }),
    );
    renderRoster();

    expect(await screen.findByText('Between seasons')).toBeInTheDocument();
    expect(screen.getAllByText('No active season')).toHaveLength(4);
    expect(scoreRequest).not.toHaveBeenCalled();
    expect(screen.queryByText(/Demo data/)).not.toBeInTheDocument();
  });

  it('should distinguish a zero score from a missing weekly baseline and a negative change', async () => {
    server.use(
      http.get('*/api/v1/wow/characters/:id/current-score', ({ params }) =>
        HttpResponse.json({
          ...current,
          characterId: params.id,
          score: 0,
          weeklyChange: params.id === 'char-aeloria' ? null : -10,
        }),
      ),
    );
    renderRoster();

    expect(await screen.findByText('No baseline yet')).toBeInTheDocument();
    expect(await screen.findAllByText('-10')).toHaveLength(3);
    expect(screen.getAllByText('0')).toHaveLength(4);
    expect(screen.getAllByRole('article').map((element) => element.getAttribute('aria-label'))).toEqual([
      'Aeloria',
      'Korren',
      'Thalren',
      'Vaelis',
    ]);
  });

  it('should retain successful data during a failed background refresh', async () => {
    const { client } = renderRoster();

    expect(await screen.findByText('2,540')).toBeInTheDocument();

    server.use(http.get('*/api/v1/wow/characters/:id/current-score', () => new HttpResponse(null, { status: 503 })));
    await client.invalidateQueries({ queryKey: ['wow', 'current-score', 'char-aeloria'] });

    expect(await screen.findByText(/Could not update score. Showing last fetched score/)).toBeInTheDocument();
    expect(screen.getByText('2,540')).toBeInTheDocument();
  });

  it('should reject a score from a different season', async () => {
    server.use(
      http.get('*/api/v1/wow/characters/:id/current-score', ({ params }) =>
        HttpResponse.json({
          ...current,
          characterId: params.id,
          season: { ...current.season, id: 'previous-season' },
        }),
      ),
    );
    renderRoster();

    expect(await screen.findByRole('button', { name: 'Retry score for Aeloria' })).toBeInTheDocument();
    expect(screen.queryByText('2,540')).not.toBeInTheDocument();
  });

  it('should use realm and identity tie breakers for equal scores and names', async () => {
    server.use(
      http.get('*/api/v1/wow/characters', () =>
        HttpResponse.json({
          ...roster,
          characters: [
            { ...roster.characters[0], id: 'third', realm: { name: 'Zulu', slug: 'zulu' } },
            { ...roster.characters[0], id: 'second' },
            { ...roster.characters[0], id: 'first' },
          ],
        }),
      ),
      http.get('*/api/v1/wow/characters/:id/current-score', ({ params }) =>
        HttpResponse.json({
          ...current,
          characterId: params.id,
          score: params.id === 'first' ? null : 0,
        }),
      ),
    );
    renderRoster();

    await waitFor(() => expect(screen.queryByText('Loading score…')).not.toBeInTheDocument());

    expect(await screen.findByText('No score yet')).toBeInTheDocument();
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('Stormrage');
  });
});
