import { getClient } from './client';
import type { ExileLatest, ExileRoster, ExileSnapshot, ExileSnapshots } from './exile-types';

export const getPoe2Roster = async (signal?: AbortSignal): Promise<ExileRoster> => {
  return (await getClient().get<ExileRoster>('/poe2/characters', { signal })).data;
};

export const getPoe2Build = async (characterId: string, signal?: AbortSignal): Promise<ExileLatest> => {
  return (await getClient().get<ExileLatest>(`/poe2/characters/${encodeURIComponent(characterId)}/build`, { signal }))
    .data;
};

export const getPoe2Snapshots = async (
  characterId: string,
  cursor?: string,
  signal?: AbortSignal,
): Promise<ExileSnapshots> => {
  return (
    await getClient().get<ExileSnapshots>(`/poe2/characters/${encodeURIComponent(characterId)}/snapshots`, {
      params: { cursor },
      signal,
    })
  ).data;
};

export const getPoe2Snapshot = async (
  characterId: string,
  snapshotId: string,
  signal?: AbortSignal,
): Promise<ExileSnapshot> => {
  return (
    await getClient().get<ExileSnapshot>(
      `/poe2/characters/${encodeURIComponent(characterId)}/snapshots/${encodeURIComponent(snapshotId)}`,
      { signal },
    )
  ).data;
};
