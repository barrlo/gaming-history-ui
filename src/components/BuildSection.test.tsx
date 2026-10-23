import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/render';
import { BuildSection } from './BuildSection';

describe('BuildSection', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('should open only equipment initially on mobile and allow independent section toggles', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: true,
        media: '',
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      }),
    );
    renderWithProviders(
      <>
        <BuildSection availability="available" empty={false} initiallyOpen title="Equipped items">
          {'Equipment content'}
        </BuildSection>
        <BuildSection availability="available" empty={false} title="Skills & linked supports">
          {'Skills content'}
        </BuildSection>
      </>,
    );
    const equipment = screen.getByRole('button', { name: 'Equipped items' });
    const skills = screen.getByRole('button', { name: 'Skills & linked supports' });

    expect(equipment).toHaveAttribute('aria-expanded', 'true');
    expect(skills).toHaveAttribute('aria-expanded', 'false');

    await user.click(skills);

    expect(skills).toHaveAttribute('aria-expanded', 'true');
    expect(equipment).toHaveAttribute('aria-expanded', 'true');

    await user.click(equipment);

    expect(equipment).toHaveAttribute('aria-expanded', 'false');
    expect(skills).toHaveAttribute('aria-expanded', 'true');
  });

  it('should show confirmed empty content separately from unavailable collection data', () => {
    const { rerender } = renderWithProviders(
      <BuildSection availability="available" empty title="Skills">
        {'Unused content'}
      </BuildSection>,
    );

    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument();
    expect(screen.getByText('None recorded for this collection.')).toBeInTheDocument();
    expect(screen.queryByText('Unused content')).not.toBeInTheDocument();

    rerender(
      <BuildSection availability="unavailable" empty title="Skills">
        {'Unused content'}
      </BuildSection>,
    );

    expect(screen.getByText('Unavailable for this collection.')).toBeInTheDocument();
    expect(screen.queryByText('None recorded for this collection.')).not.toBeInTheDocument();
  });

  it('should retain known partial content without treating missing entries as confirmed empty', () => {
    const { rerender } = renderWithProviders(
      <BuildSection availability="partial" empty={false} title="Skills">
        {'Recorded skill'}
      </BuildSection>,
    );

    expect(screen.getByText(/Some data was unavailable/)).toBeInTheDocument();
    expect(screen.getByText('Recorded skill')).toBeInTheDocument();

    rerender(
      <BuildSection availability="partial" empty title="Skills">
        {'Recorded skill'}
      </BuildSection>,
    );

    expect(screen.queryByText('Recorded skill')).not.toBeInTheDocument();
    expect(screen.queryByText('None recorded for this collection.')).not.toBeInTheDocument();
  });
});
