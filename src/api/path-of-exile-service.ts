import { getClient } from './client';
import type { ExileRoster } from './exile-types';

export const getPoeRoster = async (signal?: AbortSignal): Promise<ExileRoster> => {
  return (await getClient().get<ExileRoster>('/poe/characters', { signal })).data;
};
