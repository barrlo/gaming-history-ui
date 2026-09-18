import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchInterval: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
};
// Per-character shared queries and HTTP-derived freshness arrive in the vertical slice.
// Do not add an unconditional 30-minute staleTime: it would stack cache lifetimes.
