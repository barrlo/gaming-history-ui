import { getClient } from './client';
import type { components } from './generated/schema';

export const getPoe2Roster = async (signal?: AbortSignal): Promise<components['schemas']['PoeRoster']> => {
  return (await getClient().get<components['schemas']['PoeRoster']>('/poe2/characters', { signal })).data;
};
