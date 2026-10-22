// @vitest-environment jsdom
import { screen, within } from '@testing-library/react';
import { renderWithRouter } from '../test/render';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('should describe available games with landing links', () => {
    renderWithRouter(<HomePage />);
    const warcraft = screen.getByRole('article', { name: 'World of Warcraft' });
    const exile = screen.getByRole('article', { name: 'Path of Exile' });
    const sequel = screen.getByRole('article', { name: 'Path of Exile 2' });

    expect(screen.getByRole('heading', { name: 'Every character. Every season.' })).toBeInTheDocument();
    expect(within(exile).getByRole('link', { name: 'View characters' })).toHaveAttribute('href', '/poe');
    expect(within(warcraft).getByText('Available')).toBeInTheDocument();
    expect(within(warcraft).getByRole('link', { name: 'View characters' })).toHaveAttribute('href', '/wow');
    expect(within(exile).getByText('Available')).toBeInTheDocument();
    expect(within(sequel).getByText('Available')).toBeInTheDocument();
    expect(within(sequel).getByRole('link', { name: 'View characters' })).toHaveAttribute('href', '/poe2');
  });
});
