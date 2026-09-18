import type { components } from './generated/schema';

// This stable boundary allows switching to handwritten types without changing callers.
export type Roster = components['schemas']['Roster'];
export type Character = components['schemas']['Character'];
export type History = components['schemas']['History'];
export type CurrentScore = components['schemas']['CurrentScore'];
export type Week = components['schemas']['Week'];
export type Season = components['schemas']['Season'];
export type ApiProblem = components['schemas']['Problem'];
