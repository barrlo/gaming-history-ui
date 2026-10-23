import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test/render';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { CharacterBuild } from './CharacterBuild';
import { getPoeBuild, getPoeSnapshot, getPoeSnapshots } from '../api/path-of-exile-service';
import { getPoe2Build, getPoe2Snapshot, getPoe2Snapshots } from '../api/path-of-exile-2-service';
import { handlers } from '../mocks/handlers';
import { poeBuilds } from '../mocks/poe-builds';
import { poe2Builds } from '../mocks/poe2-builds';

vi.mock('../api/path-of-exile-service', { spy: true });
vi.mock('../api/path-of-exile-2-service', { spy: true });

const server = setupServer(...handlers);
const renderBuild = (game: 'poe' | 'poe2', characterId: string) => {
  return renderWithRouter(<CharacterBuild characterId={characterId} game={game} />);
};

describe('CharacterBuild', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should load poe latest and paginated history and switch the complete build atomically', async () => {
    const user = userEvent.setup();
    const characterId = 'c'.repeat(64);
    const latest = poeBuilds.latest.find((entry) => entry.build.character.id === characterId)!;
    const snapshots = poeBuilds.snapshots
      .filter((entry) => entry.build.character.id === characterId)
      .sort((first, second) => second.snapshot.scheduledAt.localeCompare(first.snapshot.scheduledAt));
    const buildRequest = () => HttpResponse.json(latest);
    const historyRequest = ({ request }: { request: Request }) =>
      HttpResponse.json(
        new URL(request.url).searchParams.has('cursor')
          ? { nextCursor: null, snapshots: [snapshots[1].snapshot] }
          : { nextCursor: 'older', snapshots: [snapshots[0].snapshot] },
      );
    const snapshotRequest = () => HttpResponse.json(snapshots[1]);
    server.use(
      http.get(`*/api/v1/poe/characters/:characterId/build`, buildRequest),
      http.get(`*/api/v1/poe/characters/:characterId/snapshots`, historyRequest),
      http.get(`*/api/v1/poe/characters/:characterId/snapshots/:snapshotId`, snapshotRequest),
    );
    renderBuild('poe', characterId);

    expect(await screen.findByRole('heading', { level: 1, name: latest.build.character.name })).toBeInTheDocument();
    expect(getPoeBuild).toHaveBeenCalledTimes(1);
    expect(getPoeSnapshots).toHaveBeenCalledTimes(1);
    expect(getPoeBuild).toHaveBeenNthCalledWith(1, characterId, expect.any(AbortSignal));
    expect(getPoeSnapshots).toHaveBeenNthCalledWith(1, characterId, undefined, expect.any(AbortSignal));
    expect(screen.getByRole('region', { name: 'Ascendancy skills' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All characters' })).toHaveAttribute('href', `/poe`);
    expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Load older snapshots' }));
    await user.click(screen.getByRole('combobox', { name: 'Build history' }));
    const option = await screen.findByRole('option', {
      name: new RegExp(`Level ${snapshots[1].build.character.level}$`),
    });
    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('Latest collection');
    expect(options[1]).toHaveTextContent('Level 83');
    expect(options[2]).toHaveTextContent('Level 73');

    await user.click(option);

    expect(
      await screen.findByText(`Level ${snapshots[1].build.character.level} · ${snapshots[1].build.character.class}`),
    ).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Ascendancy skills' })).not.toBeInTheDocument();
    expect(getPoeSnapshots).toHaveBeenCalledTimes(2);
    expect(getPoeSnapshot).toHaveBeenCalledTimes(1);
    expect(getPoeSnapshots).toHaveBeenNthCalledWith(2, characterId, 'older', expect.any(AbortSignal));
    expect(getPoeSnapshot).toHaveBeenNthCalledWith(1, characterId, snapshots[1].snapshot.id, expect.any(AbortSignal));
    expect(getPoeBuild).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Back to Latest' }));

    expect(screen.getByRole('region', { name: 'Ascendancy skills' })).toBeInTheDocument();
    expect(getPoeBuild).toHaveBeenCalledTimes(1);
  });

  it('should load poe2 latest and paginated history and switch the complete build atomically', async () => {
    const user = userEvent.setup();
    const characterId = 'd'.repeat(64);
    const latest = poe2Builds.latest.find((entry) => entry.build.character.id === characterId)!;
    const snapshots = poe2Builds.snapshots
      .filter((entry) => entry.build.character.id === characterId)
      .sort((first, second) => second.snapshot.scheduledAt.localeCompare(first.snapshot.scheduledAt));
    const buildRequest = () => HttpResponse.json(latest);
    const historyRequest = ({ request }: { request: Request }) =>
      HttpResponse.json(
        new URL(request.url).searchParams.has('cursor')
          ? { nextCursor: null, snapshots: [snapshots[1].snapshot] }
          : { nextCursor: 'older', snapshots: [snapshots[0].snapshot] },
      );
    const snapshotRequest = () => HttpResponse.json(snapshots[1]);
    server.use(
      http.get(`*/api/v1/poe2/characters/:characterId/build`, buildRequest),
      http.get(`*/api/v1/poe2/characters/:characterId/snapshots`, historyRequest),
      http.get(`*/api/v1/poe2/characters/:characterId/snapshots/:snapshotId`, snapshotRequest),
    );
    renderBuild('poe2', characterId);

    expect(await screen.findByRole('heading', { level: 1, name: latest.build.character.name })).toBeInTheDocument();
    expect(getPoe2Build).toHaveBeenCalledTimes(1);
    expect(getPoe2Snapshots).toHaveBeenCalledTimes(1);
    expect(getPoe2Build).toHaveBeenNthCalledWith(1, characterId, expect.any(AbortSignal));
    expect(getPoe2Snapshots).toHaveBeenNthCalledWith(1, characterId, undefined, expect.any(AbortSignal));
    expect(screen.getByRole('region', { name: 'Ascendancy skills' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All characters' })).toHaveAttribute('href', `/poe2`);
    expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Load older snapshots' }));
    await user.click(screen.getByRole('combobox', { name: 'Build history' }));
    const option = await screen.findByRole('option', {
      name: new RegExp(`Level ${snapshots[1].build.character.level}$`),
    });
    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('Latest collection');
    expect(options[1]).toHaveTextContent('Level 83');
    expect(options[2]).toHaveTextContent('Level 73');

    await user.click(option);

    expect(
      await screen.findByText(`Level ${snapshots[1].build.character.level} · ${snapshots[1].build.character.class}`),
    ).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Ascendancy skills' })).not.toBeInTheDocument();
    expect(getPoe2Snapshots).toHaveBeenCalledTimes(2);
    expect(getPoe2Snapshot).toHaveBeenCalledTimes(1);
    expect(getPoe2Snapshots).toHaveBeenNthCalledWith(2, characterId, 'older', expect.any(AbortSignal));
    expect(getPoe2Snapshot).toHaveBeenNthCalledWith(1, characterId, snapshots[1].snapshot.id, expect.any(AbortSignal));
    expect(getPoe2Build).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Back to Latest' }));

    expect(screen.getByRole('region', { name: 'Ascendancy skills' })).toBeInTheDocument();
    expect(getPoe2Build).toHaveBeenCalledTimes(1);
  });

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
    server.use(
      http.get('*/api/v1/poe/characters/:characterId/build', () => new HttpResponse(null, { status: 503 }), {
        once: true,
      }),
      http.get('*/api/v1/poe/characters/:characterId/snapshots', () => new HttpResponse(null, { status: 503 }), {
        once: true,
      }),
      http.get('*/api/v1/poe/characters/:characterId/build', () => HttpResponse.json(latest)),
      http.get('*/api/v1/poe/characters/:characterId/snapshots', () =>
        HttpResponse.json({ nextCursor: null, snapshots: [] }),
      ),
    );
    renderBuild('poe', latest.build.character.id);
    const retry = await screen.findByRole('button', { name: 'Retry build' });

    expect(getPoeBuild).toHaveBeenCalledTimes(1);
    expect(getPoeBuild).toHaveBeenNthCalledWith(1, 'f'.repeat(64), expect.any(AbortSignal));
    expect(getPoeSnapshots).toHaveBeenCalledTimes(1);
    expect(getPoeSnapshots).toHaveBeenNthCalledWith(1, 'f'.repeat(64), undefined, expect.any(AbortSignal));

    await user.click(retry);

    expect(await screen.findByRole('heading', { name: latest.build.character.name })).toBeInTheDocument();
    expect(getPoeBuild).toHaveBeenCalledTimes(2);
    expect(getPoeBuild).toHaveBeenNthCalledWith(2, 'f'.repeat(64), expect.any(AbortSignal));
    expect(getPoeSnapshots).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Archived character · Saved builds remain available.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry history' }));

    expect(await screen.findByText('No historical snapshots saved yet.')).toBeInTheDocument();
    expect(getPoeSnapshots).toHaveBeenCalledTimes(2);
    expect(getPoeSnapshots).toHaveBeenNthCalledWith(2, 'f'.repeat(64), undefined, expect.any(AbortSignal));
    expect(getPoeBuild).toHaveBeenCalledTimes(2);
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
    await user.click(select);
    const option = await screen.findByRole('option', { name: /Level 8$/ });

    expect(await screen.findByRole('heading', { name: 'Ashwarden' })).toBeInTheDocument();
    expect(getPoeBuild).toHaveBeenCalledTimes(1);
    expect(getPoeBuild).toHaveBeenNthCalledWith(1, 'a'.repeat(64), expect.any(AbortSignal));
    expect(getPoeSnapshots).toHaveBeenCalledTimes(1);
    expect(getPoeSnapshots).toHaveBeenNthCalledWith(1, 'a'.repeat(64), undefined, expect.any(AbortSignal));

    await user.click(option);

    expect(await screen.findByRole('heading', { name: 'Build could not be loaded' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Character build' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ashwarden' })).not.toBeInTheDocument();
    expect(getPoeSnapshot).toHaveBeenCalledTimes(1);
    expect(getPoeSnapshot).toHaveBeenNthCalledWith(1, 'a'.repeat(64), 'poe-a-2026-09-19', expect.any(AbortSignal));
    expect(screen.queryByRole('region', { name: 'Equipped items' })).not.toBeInTheDocument();
  });
});
