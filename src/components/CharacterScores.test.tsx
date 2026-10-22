// @vitest-environment jsdom
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/render';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { CharacterScores } from './CharacterScores';
import { createQueryClient } from '../api/query-client';
import { handlers } from '../mocks/handlers';
import { wowCurrentScores, wowRoster as roster } from '../mocks/wow-roster';

const server = setupServer(...handlers);

const renderRoster = (characters = roster.characters) => {
  const client = createQueryClient();
  renderWithProviders(<CharacterScores characters={characters} seasonId="demo-season" />, {
    queryClient: client,
  });

  return { client };
};

describe('CharacterScores', () => {
  let current: (typeof wowCurrentScores)[number];

  beforeEach(() => {
    current = wowCurrentScores[0];
  });

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should display current scores in descending order, separate null from zero, and explain weekly change', async () => {
    const requests = wowCurrentScores.map((score) => vi.fn(() => HttpResponse.json(score)));
    server.use(
      ...wowCurrentScores.map((score, index) =>
        http.get(`*/api/v1/wow/characters/${score.characterId}/current-score`, requests[index]),
      ),
    );
    renderRoster();

    expect(await screen.findByText('2,540')).toBeInTheDocument();
    expect(await screen.findByText('2,112')).toBeInTheDocument();
    expect(await screen.findByText('1,764')).toBeInTheDocument();

    const characters = screen.getAllByRole('article');

    expect(characters).toHaveLength(4);
    expect(characters[0]).toHaveAttribute('aria-label', 'Aeloria');
    expect(characters[1]).toHaveAttribute('aria-label', 'Thalren');
    expect(characters[2]).toHaveAttribute('aria-label', 'Vaelis');
    expect(characters[3]).toHaveAttribute('aria-label', 'Korren');
    expect(within(screen.getByRole('article', { name: 'Korren' })).getByText('No score yet')).toBeInTheDocument();
    expect(within(screen.getByRole('article', { name: 'Vaelis' })).getByText('0')).toBeInTheDocument();
    expect(screen.getByText('+178')).toBeInTheDocument();
    expect(requests[0]).toHaveBeenCalledTimes(1);
    expect(requests[1]).toHaveBeenCalledTimes(1);
    expect(requests[2]).toHaveBeenCalledTimes(1);
    expect(requests[3]).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('link', { name: /Aeloria/ })).not.toBeInTheDocument();
  });

  it('should retry only a failed character while preserving other scores', async () => {
    const scoreRequests = wowCurrentScores.map((score) => vi.fn(() => HttpResponse.json(score)));
    scoreRequests[0].mockImplementationOnce(() => new HttpResponse(null, { status: 503 }));
    server.use(
      ...wowCurrentScores.map((score, index) =>
        http.get(`*/api/v1/wow/characters/${score.characterId}/current-score`, scoreRequests[index]),
      ),
    );
    const user = userEvent.setup();
    renderRoster();
    const retry = await screen.findByRole('button', { name: 'Retry score for Aeloria' });

    expect(await screen.findByText('2,112')).toBeInTheDocument();
    expect(within(screen.getByRole('article', { name: 'Aeloria' })).getByText('Unavailable')).toBeInTheDocument();
    expect(scoreRequests[0]).toHaveBeenCalledTimes(1);
    expect(scoreRequests[1]).toHaveBeenCalledTimes(1);
    expect(scoreRequests[2]).toHaveBeenCalledTimes(1);
    expect(scoreRequests[3]).toHaveBeenCalledTimes(1);

    await user.click(retry);

    expect(await screen.findByText('2,540')).toBeInTheDocument();
    expect(scoreRequests[0]).toHaveBeenCalledTimes(2);
    expect(scoreRequests[1]).toHaveBeenCalledTimes(1);
    expect(scoreRequests[2]).toHaveBeenCalledTimes(1);
    expect(scoreRequests[3]).toHaveBeenCalledTimes(1);
  });

  it('should show identities while their scores are loading', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const request = vi.fn(async ({ params }: { params: Record<string, string | readonly string[]> }) => {
      await gate;

      return HttpResponse.json({ ...current, characterId: params.id });
    });
    server.use(http.get('*/api/v1/wow/characters/:id/current-score', request));
    renderRoster();

    await waitFor(() => expect(request).toHaveBeenCalledTimes(4));

    expect(screen.getByRole('article', { name: 'Aeloria' })).toHaveTextContent('Loading score…');

    release();

    expect(await screen.findAllByText('2,540')).toHaveLength(4);
    expect(request).toHaveBeenCalledTimes(4);
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

    const characters = screen.getAllByRole('article');

    expect(characters).toHaveLength(4);
    expect(characters[0]).toHaveAttribute('aria-label', 'Aeloria');
    expect(characters[1]).toHaveAttribute('aria-label', 'Korren');
    expect(characters[2]).toHaveAttribute('aria-label', 'Thalren');
    expect(characters[3]).toHaveAttribute('aria-label', 'Vaelis');
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
      http.get('*/api/v1/wow/characters/:id/current-score', ({ params }) =>
        HttpResponse.json({
          ...current,
          characterId: params.id,
          score: params.id === 'first' ? null : 0,
        }),
      ),
    );
    renderRoster([
      { ...roster.characters[0], id: 'third', realm: { name: 'Zulu', slug: 'zulu' } },
      { ...roster.characters[0], id: 'second' },
      { ...roster.characters[0], id: 'first' },
    ]);

    await waitFor(() => expect(screen.queryByText('Loading score…')).not.toBeInTheDocument());

    expect(await screen.findByText('No score yet')).toBeInTheDocument();
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('Stormrage');
  });
});
