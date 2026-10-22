import { queryOptions } from '@tanstack/react-query';
import { getCurrentScore } from './world-of-warcraft-service';

export const currentScoreQueryOptions = (characterId: string, seasonId: string) =>
  queryOptions({
    queryFn: async ({ signal }) => {
      signal.throwIfAborted();
      const current = await getCurrentScore(characterId, signal);

      if (current.characterId !== characterId || current.season?.id !== seasonId) {
        throw new Error('The current score does not match this character and season. Reload the roster.');
      }

      return current;
    },
    queryKey: ['wow', 'current-score', characterId, seasonId],
    // Revalidate on entry; the API bounds reuse by observation age and season/week boundaries.
    // A second 30-minute client timer would extend that upstream freshness window.
    staleTime: 0,
  });
