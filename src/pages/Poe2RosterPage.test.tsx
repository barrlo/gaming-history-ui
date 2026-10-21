// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { Poe2RosterPage } from './Poe2RosterPage';
import { renderWithProviders } from '../test/render';
import { handlers } from '../mocks/handlers';
import { poe2Roster } from '../mocks/poe2-roster';

const server = setupServer(...handlers);

describe('PoE2 roster page', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should render the scheduled PoE2 roster with a class-only new character', async () => {
    renderWithProviders(<Poe2RosterPage />, { initialEntries: ['/poe2'] });

    expect(await screen.findByText('Ashwarden')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'My characters' })).toBeInTheDocument();
    expect(screen.getByText(/Path of Exile 2/)).toBeInTheDocument();
    expect(screen.getByText('Witch')).toBeInTheDocument();
    expect(screen.getByText('Warrior · Titan')).toBeInTheDocument();
    expect(screen.getByText('Sorceress · Stormweaver')).toBeInTheDocument();
    expect(screen.getByText('Regular · Archived')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /update/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ashwarden/i })).not.toBeInTheDocument();
  });

  it('should retry the PoE2 roster endpoint after a failure', async () => {
    const user = userEvent.setup();
    server.use(http.get('*/api/v1/poe2/characters', () => HttpResponse.json({}, { status: 503 })));
    renderWithProviders(<Poe2RosterPage />, { initialEntries: ['/poe2'] });
    const retry = await screen.findByRole('button', { name: 'Try again' });
    server.use(http.get('*/api/v1/poe2/characters', () => HttpResponse.json(poe2Roster)));
    await user.click(retry);

    expect(await screen.findByText('Ashwarden')).toBeInTheDocument();
  });
});
