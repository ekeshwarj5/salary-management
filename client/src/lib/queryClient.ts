import { QueryClient } from '@tanstack/react-query';

/**
 * One QueryClient per app. Defaults:
 *   - staleTime: 30s — data is treated as fresh for 30s so back/forward
 *     navigation doesn't trigger a refetch storm.
 *   - refetchOnWindowFocus: false — HR users don't want their table
 *     reshuffling when they tab back.
 *   - retry: 1 — one quick retry on transient network error; anything
 *     deeper is a real issue and should surface to the user.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
