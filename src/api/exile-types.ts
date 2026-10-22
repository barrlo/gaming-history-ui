import type { components } from './generated/schema';

export type ExileRoster = components['schemas']['PoeRoster'];
export type ExileBuild = components['schemas']['PoeBuild'] | components['schemas']['Poe2Build'];
export type ExileLatest = components['schemas']['PoeLatest'] | components['schemas']['Poe2Latest'];
export type ExileSnapshot = components['schemas']['PoeSnapshot'] | components['schemas']['Poe2Snapshot'];
export type ExileSnapshots = components['schemas']['PoeSnapshots'];
export type ExileItem = components['schemas']['PoeItem'];
