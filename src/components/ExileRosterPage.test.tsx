import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test/render';
import { ExileRosterPage } from './ExileRosterPage';
import type { ExileRoster } from '../api/exile-types';
import { poeRoster } from '../mocks/poe-roster';

const renderRoster = (fetchRoster: (signal?: AbortSignal) => Promise<ExileRoster>) => {
  return renderWithRouter(<ExileRosterPage fetchRoster={fetchRoster} game="poe" title="Path of Exile" />, {
    initialEntries: ['/'],
  });
};

describe('ExileRosterPage', () => {
  it('should display stored leagues and levels in contract order with archived characters', async () => {
    const fetchRoster = vi.fn().mockResolvedValue(poeRoster);
    renderRoster(fetchRoster);

    expect(await screen.findByText('Ashwarden')).toBeInTheDocument();

    const headings = screen.getAllByRole('heading', { level: 2 });
    const rows = screen.getAllByRole('listitem');

    expect(headings).toHaveLength(3);
    expect(headings[0]).toHaveTextContent('Emberfall');
    expect(headings[1]).toHaveTextContent('Tidefall');
    expect(headings[2]).toHaveTextContent('Uncharted');
    expect(rows).toHaveLength(5);
    expect(rows[0]).toHaveTextContent('Emberwitch');
    expect(within(rows[0]).getByText(/^Lv /)).toHaveTextContent('Lv 93');
    expect(rows[1]).toHaveTextContent('IronAsh');
    expect(within(rows[1]).getByText(/^Lv /)).toHaveTextContent('Lv 75');
    expect(rows[2]).toHaveTextContent('Ashwarden');
    expect(within(rows[2]).getByText(/^Lv /)).toHaveTextContent('Lv 18');
    expect(rows[3]).toHaveTextContent('OldFlame');
    expect(within(rows[3]).getByText(/^Lv /)).toHaveTextContent('Lv 96');
    expect(rows[4]).toHaveTextContent('FirstSteps');
    expect(within(rows[4]).getByText(/^Lv /)).toHaveTextContent('Lv 8');
    expect(screen.getByText('Witch · Necromancer')).toBeInTheDocument();
    expect(screen.getByText('Hardcore')).toBeInTheDocument();
    expect(screen.getAllByText('Regular · Archived')).toHaveLength(2);
    expect(screen.getByText(/Latest collected builds. Times shown in /)).toHaveTextContent(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Ashwarden/ })).toHaveAttribute(
      'href',
      `/poe/characters/${'a'.repeat(64)}`,
    );
    expect(fetchRoster).toHaveBeenCalledTimes(1);
    expect(fetchRoster).toHaveBeenNthCalledWith(1, expect.any(AbortSignal));
  });

  it('should distinguish no ascendancy from unavailable data and awaiting a first build', async () => {
    const roster = structuredClone(poeRoster);
    roster.leagues[0].startAt = null;
    roster.leagues = [roster.leagues[0]];
    roster.leagues[0].characters = roster.leagues[0].characters.slice(0, 2);
    roster.leagues[0].characters[0].character.ascendancy = { name: null, status: 'none' };
    roster.leagues[0].characters[0].buildAvailable = false;
    roster.leagues[0].characters[1].character.ascendancy = { name: null, status: 'unavailable' };
    renderRoster(vi.fn().mockResolvedValue(roster));

    expect(await screen.findAllByText('Witch')).toHaveLength(2);
    expect(screen.getByText('Ascendancy unavailable')).toBeInTheDocument();
    expect(screen.getByText('Awaiting first build collection')).toBeInTheDocument();
    expect(screen.getByText('League start date unavailable')).toBeInTheDocument();
  });

  it('should show a loading state until the scheduled collection is available', async () => {
    let release!: (roster: ExileRoster) => void;
    const gate = new Promise<ExileRoster>((resolve) => {
      release = resolve;
    });
    const fetchRoster = vi.fn(() => gate);
    renderRoster(fetchRoster);

    expect(screen.getByRole('status', { name: 'Loading characters' })).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(fetchRoster).toHaveBeenCalledTimes(1);
    expect(fetchRoster).toHaveBeenNthCalledWith(1, expect.any(AbortSignal));

    release(poeRoster);

    expect(await screen.findByText('Ashwarden')).toBeInTheDocument();
    expect(fetchRoster).toHaveBeenCalledTimes(1);
  });

  it('should explain an empty roster without offering an on-demand refresh', async () => {
    renderRoster(vi.fn().mockResolvedValue({ game: 'poe', leagues: [] }));

    expect(await screen.findByRole('heading', { name: 'No characters collected yet' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /update|refresh/i })).not.toBeInTheDocument();
  });

  it('should isolate PoE and PoE2 query caches when switching from PoE to PoE2', async () => {
    const gate = new Promise<ExileRoster>(() => {});
    const fetchRoster = vi.fn().mockResolvedValueOnce(poeRoster).mockReturnValueOnce(gate);
    const renderGame = (game: ExileRoster['game']) => (
      <ExileRosterPage
        fetchRoster={fetchRoster}
        game={game}
        title={game === 'poe' ? 'Path of Exile' : 'Path of Exile 2'}
      />
    );
    const { rerender } = renderWithRouter(renderGame('poe'), { initialEntries: ['/'] });

    expect(await screen.findByText('Ashwarden')).toBeInTheDocument();
    expect(fetchRoster).toHaveBeenCalledTimes(1);
    expect(fetchRoster).toHaveBeenNthCalledWith(1, expect.any(AbortSignal));

    rerender(renderGame('poe2'));

    expect(screen.getByRole('status', { name: 'Loading characters' })).toBeInTheDocument();
    expect(screen.queryByText('Ashwarden')).not.toBeInTheDocument();
    expect(screen.getByText('Path of Exile 2 · League archive')).toBeInTheDocument();
    expect(fetchRoster).toHaveBeenCalledTimes(2);
    expect(fetchRoster).toHaveBeenNthCalledWith(2, expect.any(AbortSignal));
  });

  it('should retry a failed roster request without losing the page context', async () => {
    const user = userEvent.setup();
    const fetchRoster = vi.fn().mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValueOnce(poeRoster);
    renderRoster(fetchRoster);

    expect(await screen.findByRole('alert')).toHaveTextContent('Characters could not be loaded');
    expect(fetchRoster).toHaveBeenCalledTimes(1);
    expect(fetchRoster).toHaveBeenNthCalledWith(1, expect.any(AbortSignal));

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Ashwarden')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(fetchRoster).toHaveBeenCalledTimes(2);
    expect(fetchRoster).toHaveBeenNthCalledWith(2, expect.any(AbortSignal));
  });
});
