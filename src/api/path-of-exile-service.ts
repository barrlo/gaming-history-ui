import { getClient } from './client';
import type { ExileLatest, ExileRoster, ExileSnapshot, ExileSnapshots } from './exile-types';

export const getPoeRoster = async (signal?: AbortSignal): Promise<ExileRoster> => {
  return (await getClient().get<ExileRoster>('/poe/characters', { signal })).data;
};

export const getPoeBuild = async (characterId: string, signal?: AbortSignal): Promise<ExileLatest> => {
  return (await getClient().get<ExileLatest>(`/poe/characters/${encodeURIComponent(characterId)}/build`, { signal }))
    .data;
};

export const getPoeSnapshots = async (
  characterId: string,
  cursor?: string,
  signal?: AbortSignal,
): Promise<ExileSnapshots> => {
  return (
    await getClient().get<ExileSnapshots>(`/poe/characters/${encodeURIComponent(characterId)}/snapshots`, {
      params: { cursor },
      signal,
    })
  ).data;
};

export const getPoeSnapshot = async (
  characterId: string,
  snapshotId: string,
  signal?: AbortSignal,
): Promise<ExileSnapshot> => {
  return (
    await getClient().get<ExileSnapshot>(
      `/poe/characters/${encodeURIComponent(characterId)}/snapshots/${encodeURIComponent(snapshotId)}`,
      { signal },
    )
  ).data;
};
