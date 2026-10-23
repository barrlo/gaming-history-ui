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

  it('should open a character history from the WoW roster and return to the roster', async () => {
    const user = userEvent.setup();
    renderApp('/wow');
    await user.click(await screen.findByRole('link', { name: 'Aeloria' }));

    expect(await screen.findByRole('heading', { name: 'Aeloria' })).toBeInTheDocument();
    expect(await screen.findByText('Last completed week: 2,362')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'All characters' }));

    expect(await screen.findByRole('heading', { name: 'My characters' })).toBeInTheDocument();
  });

  it.each([
    ['/wow', 'My characters'],
    ['/poe', 'My characters'],
    ['/poe2', 'My characters'],
    ['/unknown', 'Page not found'],
  ])('should render %s as %s', (path, heading) => {
    renderApp(path);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
