// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { App } from './App';
import { createQueryClient } from './api/query-client';
import { useNavigation } from './state/navigation';
import './test/setup';

const renderApp = (path = '/') => {
  return render(
    <MantineProvider defaultColorScheme="dark" env="test">
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
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

    expect(screen.getByRole('heading', { name: 'Your gaming history' })).toBeInTheDocument();
    expect(screen.getByText('Gaming History').closest('a')).toBeNull();
    expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'dark');
  });

  it('should navigate from the landing page to World of Warcraft', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('link', { name: 'Explore World of Warcraft' }));

    expect(screen.getByRole('heading', { name: 'World of Warcraft' })).toBeInTheDocument();
    expect(screen.getByText('Under construction.')).toBeInTheDocument();
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
