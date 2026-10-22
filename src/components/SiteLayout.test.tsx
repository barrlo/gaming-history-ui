// @vitest-environment jsdom
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test/render';
import { SiteLayout } from './SiteLayout';
import { useNavigation } from '../state/navigation';

const renderLayout = (path = '/') =>
  renderWithRouter(
    <SiteLayout>
      <h1>{'Page content'}</h1>
    </SiteLayout>,
    { initialEntries: [path] },
  );

describe('SiteLayout', () => {
  beforeEach(() => {
    localStorage.clear();
    useNavigation.setState({ opened: false });
  });

  it('should render static branding, children, and dark theme', () => {
    renderLayout();

    expect(screen.getByRole('heading', { name: 'Page content' })).toBeInTheDocument();
    expect(screen.getByText('Gaming History')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Gaming History' })).not.toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'dark');
  });

  it('should mark the active game and navigate home without linking the brand', async () => {
    const user = userEvent.setup();
    renderLayout('/wow/characters/char-aeloria');
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' });

    expect(within(navigation).getByRole('link', { name: 'World of Warcraft' })).toHaveAttribute('aria-current', 'page');
    expect(within(navigation).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');

    await user.click(within(navigation).getByRole('link', { name: 'Home' }));

    expect(screen.getByRole('heading', { name: 'Page content' })).toBeInTheDocument();
    expect(within(navigation).getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  it('should switch themes in both directions and retain the saved preference', async () => {
    const user = userEvent.setup();
    const view = renderLayout();
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));

    expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'light');

    view.unmount();
    renderLayout();

    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));

    expect(document.documentElement).toHaveAttribute('data-mantine-color-scheme', 'dark');
  });

  it('should close the navigation drawer after selecting a game', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    const drawer = await screen.findByRole('dialog');

    expect(within(drawer).getByText('Navigation')).toBeInTheDocument();

    await user.click(within(drawer).getByRole('link', { name: 'Path of Exile 2' }));

    expect(screen.getByRole('heading', { name: 'Page content' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should dismiss the navigation drawer with Escape', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
