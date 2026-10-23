import { Route, Routes } from 'react-router-dom';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test/render';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { WorldOfWarcraftHistoryPage } from './WorldOfWarcraftHistoryPage';
import { getCurrentScore, getHistory } from '../api/world-of-warcraft-service';
import { handlers } from '../mocks/handlers';
import { wowHistories } from '../mocks/wow-history';
import { wowCurrentScores } from '../mocks/wow-roster';

vi.mock('../api/world-of-warcraft-service', { spy: true });

const server = setupServer(...handlers);
const renderHistory = (characterId = 'char-aeloria') =>
  renderWithRouter(
    <Routes>
      <Route element={<WorldOfWarcraftHistoryPage />} path="/wow/characters/:characterId" />
    </Routes>,
    { initialEntries: [`/wow/characters/${characterId}`] },
  );

describe('World of Warcraft history', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should load history and current once and refresh only current on request', async () => {
    const historyRequest = vi.fn(() => HttpResponse.json(wowHistories[0]));
    const currentRequest = vi.fn(() => HttpResponse.json(wowCurrentScores[0]));
    server.use(
      http.get('*/api/v1/wow/characters/:id/history', historyRequest),
      http.get('*/api/v1/wow/characters/:id/current-score', currentRequest),
    );
    const user = userEvent.setup();
    renderHistory();

    expect(screen.getByText('Loading history…')).toBeInTheDocument();
    expect(await screen.findByText('2,540')).toBeInTheDocument();
    expect(screen.getByText('+178')).toBeInTheDocument();
    expect(screen.getByText('Last completed week: 2,362')).toBeInTheDocument();
    expect(screen.getByText(/Week 5: 1,920, carried forward/)).toBeInTheDocument();
    expect(historyRequest).toHaveBeenCalledTimes(1);
    expect(getHistory).toHaveBeenNthCalledWith(1, 'char-aeloria', expect.any(AbortSignal));
    expect(currentRequest).toHaveBeenCalledTimes(1);
    expect(getCurrentScore).toHaveBeenNthCalledWith(1, 'char-aeloria', expect.any(AbortSignal));

    await user.click(screen.getByRole('button', { name: 'Refresh current score' }));
    await waitFor(() => expect(currentRequest).toHaveBeenCalledTimes(2));

    expect(getCurrentScore).toHaveBeenNthCalledWith(2, 'char-aeloria', expect.any(AbortSignal));
    expect(historyRequest).toHaveBeenCalledTimes(1);
  });

  it('should preserve weekly history while current is pending', async () => {
    const currentRequest = vi.fn(() => new Promise<Response>(() => {}));
    server.use(http.get('*/api/v1/wow/characters/:id/current-score', currentRequest));
    renderHistory();

    expect(await screen.findByText('Fetching current score…')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Mythic+ score history' })).toBeInTheDocument();
    expect(screen.getByText('Last completed week: 2,362')).toBeInTheDocument();
    expect(screen.queryByText('Current: 2,540.')).not.toBeInTheDocument();

    await waitFor(() => expect(currentRequest).toHaveBeenCalledTimes(1));

    expect(getCurrentScore).toHaveBeenNthCalledWith(1, 'char-aeloria', expect.any(AbortSignal));
  });

  it('should retain weekly history and retry a failed current fetch without requesting history again', async () => {
    const historyRequest = vi.fn(() => HttpResponse.json(wowHistories[0]));
    const currentRequest = vi
      .fn(() => HttpResponse.json(wowCurrentScores[0]))
      .mockImplementationOnce(() => new HttpResponse(null, { status: 503 }));
    server.use(
      http.get('*/api/v1/wow/characters/:id/history', historyRequest),
      http.get('*/api/v1/wow/characters/:id/current-score', currentRequest),
    );
    const user = userEvent.setup();
    renderHistory();

    expect(await screen.findByRole('alert')).toHaveTextContent('Saved weekly history is still available');
    expect(screen.getByRole('region', { name: 'Mythic+ score history' })).toBeInTheDocument();
    expect(historyRequest).toHaveBeenCalledTimes(1);
    expect(getHistory).toHaveBeenNthCalledWith(1, 'char-aeloria', expect.any(AbortSignal));
    expect(currentRequest).toHaveBeenCalledTimes(1);
    expect(getCurrentScore).toHaveBeenNthCalledWith(1, 'char-aeloria', expect.any(AbortSignal));

    await user.click(screen.getByRole('button', { name: 'Retry current score' }));

    expect(await screen.findByText('+178')).toBeInTheDocument();
    expect(currentRequest).toHaveBeenCalledTimes(2);
    expect(getCurrentScore).toHaveBeenNthCalledWith(2, 'char-aeloria', expect.any(AbortSignal));
    expect(historyRequest).toHaveBeenCalledTimes(1);
  });

  it('should preserve the prior current score if a manual refresh fails', async () => {
    const currentRequest = vi
      .fn()
      .mockImplementationOnce(() => HttpResponse.json(wowCurrentScores[0]))
      .mockImplementation(() => new HttpResponse(null, { status: 503 }));
    server.use(http.get('*/api/v1/wow/characters/:id/current-score', currentRequest));
    const user = userEvent.setup();
    renderHistory();

    expect(await screen.findByText('2,540')).toBeInTheDocument();
    expect(currentRequest).toHaveBeenCalledTimes(1);
    expect(getCurrentScore).toHaveBeenNthCalledWith(1, 'char-aeloria', expect.any(AbortSignal));

    await user.click(screen.getByRole('button', { name: 'Refresh current score' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Showing the last fetched score');
    expect(screen.getByText('2,540')).toBeInTheDocument();
    expect(currentRequest).toHaveBeenCalledTimes(2);
    expect(getCurrentScore).toHaveBeenNthCalledWith(2, 'char-aeloria', expect.any(AbortSignal));
  });

  it('should retry history after a failure before requesting current', async () => {
    const historyRequest = vi
      .fn(() => HttpResponse.json(wowHistories[0]))
      .mockImplementationOnce(() => new HttpResponse(null, { status: 503 }));
    const currentRequest = vi.fn(() => HttpResponse.json(wowCurrentScores[0]));
    server.use(
      http.get('*/api/v1/wow/characters/:id/history', historyRequest),
      http.get('*/api/v1/wow/characters/:id/current-score', currentRequest),
    );
    const user = userEvent.setup();
    renderHistory();

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load history');
    expect(currentRequest).not.toHaveBeenCalled();
    expect(historyRequest).toHaveBeenCalledTimes(1);
    expect(getHistory).toHaveBeenNthCalledWith(1, 'char-aeloria', expect.any(AbortSignal));

    await user.click(screen.getByRole('button', { name: 'Retry history' }));

    expect(await screen.findByText('2,540')).toBeInTheDocument();
    expect(historyRequest).toHaveBeenCalledTimes(2);
    expect(getHistory).toHaveBeenNthCalledWith(2, 'char-aeloria', expect.any(AbortSignal));
    expect(currentRequest).toHaveBeenCalledTimes(1);
    expect(getCurrentScore).toHaveBeenNthCalledWith(1, 'char-aeloria', expect.any(AbortSignal));
  });

  it('should show a not-found state for an unknown character', async () => {
    renderHistory('unknown');

    expect(await screen.findByRole('alert')).toHaveTextContent('Character not found');
    expect(screen.queryByRole('button', { name: 'Retry history' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All characters' })).toHaveAttribute('href', '/wow');
  });

  it('should reject history belonging to a different character', async () => {
    server.use(http.get('*/api/v1/wow/characters/:id/history', () => HttpResponse.json(wowHistories[0])));
    renderHistory('char-korren');

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load history');
    expect(screen.queryByRole('heading', { name: 'Aeloria' })).not.toBeInTheDocument();
  });

  it.each([
    { ...wowCurrentScores[0], characterId: 'other' },
    { ...wowCurrentScores[0], season: { ...wowCurrentScores[0].season, id: 'other' } },
  ])('should reject current data from another character or season', async (current) => {
    server.use(http.get('*/api/v1/wow/characters/:id/current-score', () => HttpResponse.json(current)));
    renderHistory();

    expect(await screen.findByRole('alert')).toHaveTextContent('Saved weekly history is still available');
    expect(screen.queryByText('2,540')).not.toBeInTheDocument();
  });

  it('should show the between-season state without fetching current', async () => {
    const currentRequest = vi.fn(() => HttpResponse.json(wowCurrentScores[0]));
    server.use(
      http.get('*/api/v1/wow/characters/:id/history', () =>
        HttpResponse.json({ ...wowHistories[0], season: null, weeks: [] }),
      ),
      http.get('*/api/v1/wow/characters/:id/current-score', currentRequest),
    );
    renderHistory();

    expect(await screen.findByText(/There is no active season/)).toBeInTheDocument();
    expect(currentRequest).not.toHaveBeenCalled();
  });

  it('should distinguish unobserved scores and baseline from zero', async () => {
    renderHistory('char-korren');

    expect(await screen.findByText('No score yet')).toBeInTheDocument();
    expect(screen.getByText('No completed-week baseline yet.')).toBeInTheDocument();
    expect(screen.getByText(/No scores observed yet/)).toBeInTheDocument();
  });

  it.each([0, -25])('should show a numeric weekly change of %s', async (change) => {
    server.use(
      http.get('*/api/v1/wow/characters/:id/current-score', () =>
        HttpResponse.json({ ...wowCurrentScores[0], score: 0, weeklyChange: change }),
      ),
    );
    renderHistory();

    expect(
      await within(await screen.findByRole('group', { name: 'Weekly comparison' })).findByText(String(change)),
    ).toBeInTheDocument();
    expect(screen.getByText('Current: 0.')).toBeInTheDocument();
  });
});
