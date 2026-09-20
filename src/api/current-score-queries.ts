import { queryOptions } from '@tanstack/react-query';
import { getCurrentScore } from './world-of-warcraft-service';

let activeRequests = 0;
const waitingRequests: (() => void)[] = [];

const withCurrentScoreSlot = async <Result>(request: () => Promise<Result>): Promise<Result> => {
  if (activeRequests >= 3) {
    await new Promise<void>((resolve) => waitingRequests.push(resolve));
  } else {
    activeRequests += 1;
  }

  try {
    return await request();
  } finally {
    const nextRequest = waitingRequests.shift();

    if (nextRequest) {
      nextRequest();
    } else {
      activeRequests -= 1;
    }
  }
};

export const currentScoreQueryOptions = (characterId: string, seasonId: string) =>
  queryOptions({
    queryFn: ({ signal }) =>
      withCurrentScoreSlot(async () => {
        signal.throwIfAborted();
        const current = await getCurrentScore(characterId, signal);

        if (current.characterId !== characterId || current.season?.id !== seasonId) {
          throw new Error('The current score does not match this character and season. Reload the roster.');
        }

        return current;
      }),
    queryKey: ['wow', 'current-score', characterId, seasonId],
    // Revalidate on entry; the API bounds reuse by observation age and season/week boundaries.
    // A second 30-minute client timer would extend that upstream freshness window.
    staleTime: 0,
  });
