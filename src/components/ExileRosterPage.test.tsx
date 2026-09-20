// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { ExileRosterPage } from './ExileRosterPage';
import type { ExileRoster } from '../api/exile-types';
import { createQueryClient } from '../api/query-client';
import { poeRoster } from '../mocks/poe-roster';
import '../test/setup';

const renderRoster = (fetchRoster: (signal?: AbortSignal) => Promise<ExileRoster>) => {
  return render(
    <MantineProvider env="test">
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <ExileRosterPage fetchRoster={fetchRoster} game="poe" title="Path of Exile" />
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>,
  );
};

describe('ExileRosterPage', () => {
  it('should display stored league groups and levels in contract order with archived characters', async () => {
    const fetchRoster = vi.fn().mockResolvedValue(poeRoster);
    renderRoster(fetchRoster);

    expect(await screen.findByText('Ashwarden')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)).toEqual([
      'Demo league · Emberfall',
      'Demo league · Firstlight',
    ]);
    expect(screen.getAllByRole('listitem').map((row) => within(row).getByText(/^Lv /).textContent)).toEqual([
      'Lv 91',
      'Lv 67',
      'Lv 94',
    ]);
    expect(screen.getByText('Witch · Elementalist')).toBeInTheDocument();
    expect(screen.getByText('Hardcore · SSF')).toBeInTheDocument();
    expect(screen.getByText('Regular · Archived')).toBeInTheDocument();
    expect(screen.getByText('Collected Aug 31, 2026, 3:00 AM CT')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('link', { name: /Ashwarden/ })).not.toBeInTheDocument();
    expect(fetchRoster).toHaveBeenCalledWith(expect.any(AbortSignal));
  });

  it('should distinguish no ascendancy from unavailable data and awaiting a first build', async () => {
    const roster = structuredClone(poeRoster);
    roster.groups[0].startAt = null;
    roster.groups[0].characters[0].character.ascendancy = { name: null, status: 'none' };
    roster.groups[0].characters[0].buildAvailable = false;
    roster.groups[0].characters[1].character.ascendancy = { name: null, status: 'unavailable' };
    renderRoster(vi.fn().mockResolvedValue(roster));

    expect(await screen.findByText('Witch')).toBeInTheDocument();
    expect(screen.getByText('Marauder')).toBeInTheDocument();
    expect(screen.getByText('Ascendancy unavailable')).toBeInTheDocument();
    expect(screen.getByText('Awaiting first build collection')).toBeInTheDocument();
    expect(screen.getByText('League start date unavailable')).toBeInTheDocument();
  });

  it('should show a loading state until the scheduled collection is available', () => {
    renderRoster(() => new Promise<ExileRoster>(() => {}));

    expect(screen.getByRole('status', { name: 'Loading characters' })).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('should explain an empty roster without offering an on-demand refresh', async () => {
    renderRoster(vi.fn().mockResolvedValue({ game: 'poe', groups: [] }));

    expect(await screen.findByRole('heading', { name: 'No characters collected yet' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /update|refresh/i })).not.toBeInTheDocument();
  });

  it('should isolate each game query so a pending sequel never displays the first game roster', async () => {
    const client = createQueryClient();
    const fetchRoster = vi
      .fn()
      .mockResolvedValueOnce(poeRoster)
      .mockImplementationOnce(() => new Promise<ExileRoster>(() => {}));
    const renderGame = (game: ExileRoster['game']) => (
      <MantineProvider env="test">
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <ExileRosterPage
              fetchRoster={fetchRoster}
              game={game}
              title={game === 'poe' ? 'Path of Exile' : 'Path of Exile 2'}
            />
          </MemoryRouter>
        </QueryClientProvider>
      </MantineProvider>
    );
    const view = render(renderGame('poe'));

    expect(await screen.findByText('Ashwarden')).toBeInTheDocument();

    view.rerender(renderGame('poe2'));

    expect(screen.getByRole('status', { name: 'Loading characters' })).toBeInTheDocument();
    expect(screen.queryByText('Ashwarden')).not.toBeInTheDocument();
    expect(screen.getByText('Path of Exile 2 · League archive')).toBeInTheDocument();
  });

  it('should retry a failed roster request without losing the page context', async () => {
    const user = userEvent.setup();
    const fetchRoster = vi.fn().mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValueOnce(poeRoster);
    renderRoster(fetchRoster);

    expect(await screen.findByRole('alert')).toHaveTextContent('Characters could not be loaded');

    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Ashwarden')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(fetchRoster).toHaveBeenCalledTimes(2);
  });
});
