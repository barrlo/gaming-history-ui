// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { MantineProvider } from '@mantine/core';
import { Poe2RosterPage } from './Poe2RosterPage';
import { cssVariablesResolver, theme } from '../theme';
import roster from '../../contracts/v1/fixtures/poe-expansion/poe2-roster.json';
import '../test/setup';

const server = setupServer(http.get('*/api/v1/poe2/characters', () => HttpResponse.json(roster)));

const renderRoster = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <MantineProvider cssVariablesResolver={cssVariablesResolver} defaultColorScheme="dark" env="test" theme={theme}>
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <Poe2RosterPage />
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>,
  );
};

describe('PoE2 roster page', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it('should render the scheduled PoE2 roster with a class-only new character', async () => {
    renderRoster();

    expect(await screen.findByText('Ashwarden')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'My characters' })).toBeInTheDocument();
    expect(screen.getByText(/Path of Exile 2/)).toBeInTheDocument();
    expect(screen.getByText('Witch')).toBeInTheDocument();
    expect(screen.queryByText('Infernalist')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /update/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ashwarden/i })).not.toBeInTheDocument();
  });

  it('should retry the PoE2 roster endpoint after a failure', async () => {
    const user = userEvent.setup();
    server.use(http.get('*/api/v1/poe2/characters', () => HttpResponse.json({}, { status: 503 })));
    renderRoster();
    const retry = await screen.findByRole('button', { name: 'Try again' });
    server.use(http.get('*/api/v1/poe2/characters', () => HttpResponse.json(roster)));
    await user.click(retry);

    expect(await screen.findByText('Ashwarden')).toBeInTheDocument();
  });
});
