import { Link, createMemoryRouter, RouterProvider } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/render';
import { setupServer } from 'msw/node';
import { ExileCharacterPage } from './ExileCharacterPage';
import { getPoeBuild, getPoeSnapshot } from '../api/path-of-exile-service';
import { getPoe2Build, getPoe2Snapshot } from '../api/path-of-exile-2-service';
import { handlers } from '../mocks/handlers';

vi.mock('../api/path-of-exile-service', { spy: true });
vi.mock('../api/path-of-exile-2-service', { spy: true });

const server = setupServer(...handlers);
const renderPage = () => {
  return renderWithProviders(
    <RouterProvider
      router={createMemoryRouter(
        [
          {
            element: (
              <>
                <Link to={`/poe/characters/${'a'.repeat(64)}`}>{'Another character'}</Link>
                <Link to={`/poe2/characters/${'d'.repeat(64)}`}>{'Another game'}</Link>
                <ExileCharacterPage game="poe" />
              </>
            ),
            path: '/poe/characters/:characterId',
          },
          { element: <ExileCharacterPage game="poe2" />, path: '/poe2/characters/:characterId' },
        ],
        { initialEntries: [`/poe/characters/${'c'.repeat(64)}`] },
      )}
    />,
  );
};

describe('ExileCharacterPage', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should reset a selected snapshot when navigating to another character', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Emberwitch' })).toBeInTheDocument();
    expect(getPoeBuild).toHaveBeenNthCalledWith(1, 'c'.repeat(64), expect.any(AbortSignal));

    await user.click(screen.getByRole('combobox', { name: 'Build history' }));
    await user.click(await screen.findByRole('option', { name: /Level 83$/ }));

    expect(await screen.findByText('Level 83 · Witch · Necromancer')).toBeInTheDocument();
    expect(getPoeSnapshot).toHaveBeenCalledTimes(1);
    expect(getPoeSnapshot).toHaveBeenNthCalledWith(1, 'c'.repeat(64), 'poe-c-2026-09-19', expect.any(AbortSignal));

    await user.click(screen.getByRole('link', { name: 'Another character' }));

    expect(await screen.findByRole('heading', { name: 'Ashwarden' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Build history' })).toHaveValue('Latest collection');
    expect(getPoeBuild).toHaveBeenNthCalledWith(2, 'a'.repeat(64), expect.any(AbortSignal));
    expect(getPoeSnapshot).toHaveBeenCalledTimes(1);
  });

  it('should reset a selected snapshot when navigating to another game', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Emberwitch' })).toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Build history' }));
    await user.click(await screen.findByRole('option', { name: /Level 83$/ }));

    expect(await screen.findByText('Level 83 · Witch · Necromancer')).toBeInTheDocument();
    expect(getPoeSnapshot).toHaveBeenCalledTimes(1);
    expect(getPoeSnapshot).toHaveBeenNthCalledWith(1, 'c'.repeat(64), 'poe-c-2026-09-19', expect.any(AbortSignal));

    await user.click(screen.getByRole('link', { name: 'Another game' }));

    expect(await screen.findByRole('heading', { name: 'Stormwarden' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Build history' })).toHaveValue('Latest collection');
    expect(getPoe2Build).toHaveBeenCalledTimes(1);
    expect(getPoe2Build).toHaveBeenNthCalledWith(1, 'd'.repeat(64), expect.any(AbortSignal));
    expect(getPoe2Snapshot).not.toHaveBeenCalled();
  });
});
