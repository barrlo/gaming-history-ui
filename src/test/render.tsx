import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { createQueryClient } from '../api/query-client';
import { cssVariablesResolver, theme } from '../theme';
import './setup';

type RenderOptions = {
  initialEntries?: string[];
  queryClient?: QueryClient;
};

export const renderWithProviders = (element: ReactElement, options: RenderOptions = {}) => {
  const queryClient = options.queryClient ?? createQueryClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MantineProvider cssVariablesResolver={cssVariablesResolver} defaultColorScheme="dark" env="test" theme={theme}>
      <QueryClientProvider client={queryClient}>
        {options.initialEntries ? (
          <MemoryRouter initialEntries={options.initialEntries}>{children}</MemoryRouter>
        ) : (
          children
        )}
      </QueryClientProvider>
    </MantineProvider>
  );

  return render(element, { wrapper: Wrapper });
};
