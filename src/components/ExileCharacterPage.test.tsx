import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/render';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ExileCharacterPage } from './ExileCharacterPage';
import { getPoeBuild, getPoeSnapshot, getPoeSnapshots } from '../api/path-of-exile-service';
import { getPoe2Build, getPoe2Snapshot, getPoe2Snapshots } from '../api/path-of-exile-2-service';
import { handlers } from '../mocks/handlers';
import { poeBuilds } from '../mocks/poe-builds';
import { poe2Builds } from '../mocks/poe2-builds';

vi.mock('../api/path-of-exile-service', { spy: true });
vi.mock('../api/path-of-exile-2-service', { spy: true });

const server = setupServer(...handlers);
const renderBuild = (game: 'poe' | 'poe2', characterId: string) => {
  return renderWithProviders(
    <RouterProvider
      router={createMemoryRouter([{ element: <ExileCharacterPage game={game} />, path: '/:characterId' }], {
        initialEntries: [`/${characterId}`],
      })}
    />,
  );
};

describe('ExileCharacterPage', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  for (const game of ['poe', 'poe2'] as const) {
    it(`should load ${game} latest and paginated history and switch the complete build atomically`, async () => {
      const user = userEvent.setup();
      const services =
        game === 'poe'
          ? { build: getPoeBuild, snapshot: getPoeSnapshot, snapshots: getPoeSnapshots }
          : { build: getPoe2Build, snapshot: getPoe2Snapshot, snapshots: getPoe2Snapshots };
      const fixtures = game === 'poe' ? poeBuilds : poe2Builds;
      const characterId = (game === 'poe' ? 'c' : 'd').repeat(64);
      const latest = fixtures.latest.find((entry) => entry.build.character.id === characterId)!;
      const snapshots = fixtures.snapshots
        .filter((entry) => entry.build.character.id === characterId)
        .sort((first, second) => second.snapshot.scheduledAt.localeCompare(first.snapshot.scheduledAt));
      const buildRequest = vi.fn(() => HttpResponse.json(latest));
      const historyRequest = vi.fn(({ request }: { request: Request }) =>
        HttpResponse.json(
          new URL(request.url).searchParams.has('cursor')
            ? { nextCursor: null, snapshots: [snapshots[1].snapshot] }
            : { nextCursor: 'older', snapshots: [snapshots[0].snapshot] },
        ),
      );
      const snapshotRequest = vi.fn(() => HttpResponse.json(snapshots[1]));
      server.use(
        http.get(`*/api/v1/${game}/characters/:characterId/build`, buildRequest),
        http.get(`*/api/v1/${game}/characters/:characterId/snapshots`, historyRequest),
        http.get(`*/api/v1/${game}/characters/:characterId/snapshots/:snapshotId`, snapshotRequest),
      );
      renderBuild(game, characterId);

      expect(await screen.findByRole('heading', { level: 1, name: latest.build.character.name })).toBeInTheDocument();
      expect(buildRequest).toHaveBeenCalledTimes(1);
      expect(historyRequest).toHaveBeenCalledTimes(1);
      expect(services.build).toHaveBeenNthCalledWith(1, characterId, expect.any(AbortSignal));
      expect(services.snapshots).toHaveBeenNthCalledWith(1, characterId, undefined, expect.any(AbortSignal));
      expect(screen.getByRole('region', { name: 'Ascendancy skills' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'All characters' })).toHaveAttribute('href', `/${game}`);
      expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Load older snapshots' }));
      const option = await screen.findByRole('option', {
        name: new RegExp(`Level ${snapshots[1].build.character.level}$`),
      });
      const options = within(screen.getByRole('combobox', { name: 'Build history' })).getAllByRole('option');

      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('Latest collection');
      expect(options[1]).toHaveTextContent('Level 83');
      expect(options[2]).toHaveTextContent('Level 73');

      await user.selectOptions(screen.getByRole('combobox', { name: 'Build history' }), option);

      expect(
        await screen.findByText(`Level ${snapshots[1].build.character.level} · ${snapshots[1].build.character.class}`),
      ).toBeInTheDocument();
      expect(screen.queryByRole('region', { name: 'Ascendancy skills' })).not.toBeInTheDocument();
      expect(historyRequest).toHaveBeenCalledTimes(2);
      expect(snapshotRequest).toHaveBeenCalledTimes(1);
      expect(services.snapshots).toHaveBeenNthCalledWith(2, characterId, 'older', expect.any(AbortSignal));
      expect(services.snapshot).toHaveBeenNthCalledWith(
        1,
        characterId,
        snapshots[1].snapshot.id,
        expect.any(AbortSignal),
      );
      expect(buildRequest).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole('button', { name: 'Back to Latest' }));

      expect(screen.getByRole('region', { name: 'Ascendancy skills' })).toBeInTheDocument();
      expect(buildRequest).toHaveBeenCalledTimes(1);
    });
  }

  it('should show independent loading states without inventing a build', () => {
    server.use(
      http.get('*/api/v1/poe/characters/:characterId/build', () => new Promise(() => {})),
      http.get('*/api/v1/poe/characters/:characterId/snapshots', () => new Promise(() => {})),
    );
    renderBuild('poe', 'a'.repeat(64));

    expect(screen.getByRole('heading', { level: 1, name: 'Character build' })).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Loading build' })).toBeInTheDocument();
    expect(screen.getByText('Loading saved dates…')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Equipped items' })).not.toBeInTheDocument();
    expect(getPoeBuild).toHaveBeenCalledTimes(1);
    expect(getPoeBuild).toHaveBeenNthCalledWith(1, 'a'.repeat(64), expect.any(AbortSignal));
    expect(getPoeSnapshots).toHaveBeenCalledTimes(1);
    expect(getPoeSnapshots).toHaveBeenNthCalledWith(1, 'a'.repeat(64), undefined, expect.any(AbortSignal));
  });

  it('should retry failed build and history requests independently', async () => {
    const user = userEvent.setup();
    const latest = poeBuilds.latest[0];
    const buildRequest = vi
      .fn(() => HttpResponse.json(latest))
      .mockImplementationOnce(() => new HttpResponse(null, { status: 503 }));
    const historyRequest = vi
      .fn(() => HttpResponse.json({ nextCursor: null, snapshots: [] }))
      .mockImplementationOnce(() => new HttpResponse(null, { status: 503 }));
    server.use(
      http.get('*/api/v1/poe/characters/:characterId/build', buildRequest),
      http.get('*/api/v1/poe/characters/:characterId/snapshots', historyRequest),
    );
    renderBuild('poe', latest.build.character.id);
    const retry = await screen.findByRole('button', { name: 'Retry build' });

    expect(buildRequest).toHaveBeenCalledTimes(1);
    expect(getPoeBuild).toHaveBeenNthCalledWith(1, 'f'.repeat(64), expect.any(AbortSignal));
    expect(historyRequest).toHaveBeenCalledTimes(1);
    expect(getPoeSnapshots).toHaveBeenNthCalledWith(1, 'f'.repeat(64), undefined, expect.any(AbortSignal));

    await user.click(retry);

    expect(await screen.findByRole('heading', { name: latest.build.character.name })).toBeInTheDocument();
    expect(buildRequest).toHaveBeenCalledTimes(2);
    expect(getPoeBuild).toHaveBeenNthCalledWith(2, 'f'.repeat(64), expect.any(AbortSignal));
    expect(historyRequest).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Archived character · Saved builds remain available.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry history' }));

    expect(await screen.findByText('No historical snapshots saved yet.')).toBeInTheDocument();
    expect(historyRequest).toHaveBeenCalledTimes(2);
    expect(getPoeSnapshots).toHaveBeenNthCalledWith(2, 'f'.repeat(64), undefined, expect.any(AbortSignal));
    expect(buildRequest).toHaveBeenCalledTimes(2);
  });

  it('should not show latest identity or equipment under a failed historical selection', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        '*/api/v1/poe/characters/:characterId/snapshots/:snapshotId',
        () => new HttpResponse(null, { status: 404 }),
      ),
    );
    renderBuild('poe', 'a'.repeat(64));
    const select = screen.getByRole('combobox', { name: 'Build history' });
    const option = await within(select).findByRole('option', { name: /Level 8$/ });

    expect(await screen.findByRole('heading', { name: 'Ashwarden' })).toBeInTheDocument();
    expect(getPoeBuild).toHaveBeenCalledTimes(1);
    expect(getPoeBuild).toHaveBeenNthCalledWith(1, 'a'.repeat(64), expect.any(AbortSignal));
    expect(getPoeSnapshots).toHaveBeenCalledTimes(1);
    expect(getPoeSnapshots).toHaveBeenNthCalledWith(1, 'a'.repeat(64), undefined, expect.any(AbortSignal));

    await user.selectOptions(select, option);

    expect(await screen.findByRole('heading', { name: 'Build could not be loaded' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Character build' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ashwarden' })).not.toBeInTheDocument();
    expect(getPoeSnapshot).toHaveBeenCalledTimes(1);
    expect(getPoeSnapshot).toHaveBeenNthCalledWith(1, 'a'.repeat(64), 'poe-a-2026-09-19', expect.any(AbortSignal));
    expect(screen.queryByRole('region', { name: 'Equipped items' })).not.toBeInTheDocument();
  });
});
