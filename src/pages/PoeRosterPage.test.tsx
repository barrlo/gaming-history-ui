// @vitest-environment jsdom
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../test/render';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { PoeRosterPage } from './PoeRosterPage';
import { handlers } from '../mocks/handlers';
import { poeRoster } from '../mocks/poe-roster';

const server = setupServer(...handlers);

describe('PoE roster page', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should render the scheduled PoE roster on entry', async () => {
    const rosterRequest = vi.fn(() => HttpResponse.json(poeRoster));
    server.use(http.get('*/api/v1/poe/characters', rosterRequest));
    renderWithRouter(<PoeRosterPage />, { initialEntries: ['/poe'] });

    expect(await screen.findByText('Ashwarden')).toBeInTheDocument();
    expect(rosterRequest).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { name: 'My characters' })).toBeInTheDocument();
    expect(screen.getByText(/Path of Exile/)).toBeInTheDocument();
    expect(screen.getByText('Regular · Archived')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /update/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ashwarden/i })).not.toBeInTheDocument();
  });

  it('should retry the PoE roster endpoint after a failure', async () => {
    const user = userEvent.setup();
    const rosterRequest = vi
      .fn(() => HttpResponse.json(poeRoster))
      .mockImplementationOnce(() => new HttpResponse(null, { status: 503 }));
    server.use(http.get('*/api/v1/poe/characters', rosterRequest));
    renderWithRouter(<PoeRosterPage />, { initialEntries: ['/poe'] });
    const retry = await screen.findByRole('button', { name: 'Try again' });

    expect(rosterRequest).toHaveBeenCalledTimes(1);

    await user.click(retry);

    expect(await screen.findByText('Ashwarden')).toBeInTheDocument();
    expect(rosterRequest).toHaveBeenCalledTimes(2);
  });
});
