import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { createQueryClient } from '../api/query-client';
import { cssVariablesResolver, theme } from '../theme';
import './setup';

type RenderOptions = {
  queryClient?: QueryClient;
};

type RouterRenderOptions = RenderOptions & {
  initialEntries?: string[];
};

const TestProviders = ({ children, queryClient }: { children: ReactNode; queryClient: QueryClient }) => (
  <MantineProvider cssVariablesResolver={cssVariablesResolver} defaultColorScheme="dark" env="test" theme={theme}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </MantineProvider>
);

export const renderWithProviders = (element: ReactElement, options: RenderOptions = {}) => {
  const queryClient = options.queryClient ?? createQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>{children}</TestProviders>
  );

  return render(element, { wrapper: Wrapper });
};

export const renderWithRouter = (element: ReactElement, options: RouterRenderOptions = {}) => {
  const queryClient = options.queryClient ?? createQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders queryClient={queryClient}>
      <MemoryRouter initialEntries={options.initialEntries ?? ['/']}>{children}</MemoryRouter>
    </TestProviders>
  );

  return render(element, { wrapper: Wrapper });
};
