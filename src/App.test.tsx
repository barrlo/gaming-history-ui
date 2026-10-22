// @vitest-environment jsdom
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './test/render';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';
import { routes } from './routes';
import { useNavigation } from './state/navigation';

const server = setupServer(...handlers);

const renderApp = (path = '/') => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  return renderWithProviders(<RouterProvider router={router} />);
};

describe('App', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  beforeEach(() => {
    localStorage.clear();
    useNavigation.setState({ opened: false });
  });

  it('should navigate from the landing page to World of Warcraft', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(
      within(screen.getByRole('article', { name: 'World of Warcraft' })).getByRole('link', { name: 'View characters' }),
    );

    expect(screen.getByRole('heading', { name: 'My characters' })).toBeInTheDocument();
  });

  it('should navigate from the landing page to Path of Exile', async () => {
    const user = userEvent.setup();
    renderApp();
    const exile = screen.getByRole('article', { name: 'Path of Exile' });
    await user.click(within(exile).getByRole('link', { name: 'View characters' }));

    expect(screen.getByRole('heading', { name: 'My characters' })).toBeInTheDocument();
  });

  it.each([
    ['/wow', 'My characters'],
    ['/wow/characters/char-aeloria', 'Character history'],
    ['/poe', 'My characters'],
    ['/poe2', 'My characters'],
    ['/unknown', 'Page not found'],
  ])('should render %s as %s', (path, heading) => {
    renderApp(path);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
