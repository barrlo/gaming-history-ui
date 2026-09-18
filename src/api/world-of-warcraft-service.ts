import { getClient } from './client';
import type { Roster, History, CurrentScore } from './types';

export const getRoster = async (signal?: AbortSignal): Promise<Roster> => {
  return (await getClient().get<Roster>('/wow/characters', { signal })).data;
};

export const getHistory = async (characterId: string, signal?: AbortSignal): Promise<History> => {
  return (
    await getClient().get<History>(`/wow/characters/${encodeURIComponent(characterId)}/history`, {
      params: { season: 'current' },
      signal,
    })
  ).data;
};

export const getCurrentScore = async (characterId: string, signal?: AbortSignal): Promise<CurrentScore> => {
  return (
    await getClient().get<CurrentScore>(`/wow/characters/${encodeURIComponent(characterId)}/current-score`, {
      params: { season: 'current' },
      signal,
    })
  ).data;
};
