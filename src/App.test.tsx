// @vitest-environment jsdom
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { createQueryClient } from './api/query-client';
import { routes } from './routes';
import { cssVariablesResolver, theme } from './theme';
import { useNavigation } from './state/navigation';
import './test/setup';

const renderApp = (path = '/') => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  return render(
    <MantineProvider cssVariablesResolver={cssVariablesResolver} defaultColorScheme="dark" env="test" theme={theme}>
      <QueryClientProvider client={createQueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MantineProvider>,
  );
};

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    useNavigation.setState({ opened: false });
  });

  it('should render the landing page with static branding and dark theme', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: 'Every character. Every season.' })).toBeInTheDocument();
    expect(screen.getByText('Gaming History')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Gaming History' })).not.toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'dark');
  });

  it('should navigate from the landing page to World of Warcraft', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('link', { name: 'View characters' }));

    expect(screen.getByRole('heading', { name: 'World of Warcraft' })).toBeInTheDocument();
    expect(screen.getByText('Under construction.')).toBeInTheDocument();
  });

  it('should describe available and upcoming games with working landing links', async () => {
    const user = userEvent.setup();
    renderApp();
    const warcraft = screen.getByRole('article', { name: 'World of Warcraft' });
    const exile = screen.getByRole('article', { name: 'Path of Exile' });
    const sequel = screen.getByRole('article', { name: 'Path of Exile 2' });

    expect(within(warcraft).getByText('Available')).toBeInTheDocument();
    expect(within(warcraft).getByRole('link', { name: 'View characters' })).toHaveAttribute('href', '/wow');
    expect(within(exile).getByText('Under construction')).toBeInTheDocument();
    expect(within(sequel).getByText('Under construction')).toBeInTheDocument();
    expect(within(sequel).getByRole('link', { name: 'View page' })).toHaveAttribute('href', '/poe2');

    await user.click(within(exile).getByRole('link', { name: 'View page' }));

    expect(screen.getByRole('heading', { name: 'Path of Exile' })).toBeInTheDocument();
  });

  it('should mark the active game and navigate home without linking the brand', async () => {
    const user = userEvent.setup();
    renderApp('/wow/characters/char-aeloria');
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' });

    expect(within(navigation).getByRole('link', { name: 'World of Warcraft' })).toHaveAttribute('aria-current', 'page');
    expect(within(navigation).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');

    await user.click(within(navigation).getByRole('link', { name: 'Home' }));

    expect(screen.getByRole('heading', { name: 'Every character. Every season.' })).toBeInTheDocument();
    expect(within(navigation).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  it.each([
    ['/wow', 'World of Warcraft'],
    ['/wow/characters/char-aeloria', 'Character history'],
    ['/poe', 'Path of Exile'],
    ['/poe2', 'Path of Exile 2'],
    ['/unknown', 'Page not found'],
  ])('should render %s as %s', (path, heading) => {
    renderApp(path);

    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });

  it('should switch themes in both directions and retain the saved preference', async () => {
    const user = userEvent.setup();
    const view = renderApp();
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));

    expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'light');

    view.unmount();
    renderApp();

    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));

    expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'dark');
  });

  it('should close the navigation drawer after selecting a game', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    const drawer = await screen.findByRole('dialog');

    expect(within(drawer).getByText('Navigation')).toBeInTheDocument();

    await user.click(within(drawer).getByRole('link', { name: 'Path of Exile 2' }));

    expect(screen.getByRole('heading', { name: 'Path of Exile 2' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should dismiss the navigation drawer with Escape', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
