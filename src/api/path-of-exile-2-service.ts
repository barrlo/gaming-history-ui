import { getClient } from './client';
import type { ExileRoster } from './exile-types';

export const getPoe2Roster = async (signal?: AbortSignal): Promise<ExileRoster> => {
  return (await getClient().get<ExileRoster>('/poe2/characters', { signal })).data;
};
