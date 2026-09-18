import type { CurrentScore, Week } from './types';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Assert<T extends true> = T;
// Compilation fails if generation loses nullability or discriminated weekly states.
export type CurrentNullable = Assert<Equal<CurrentScore['score'], number | null>>;
export type ObservedNumeric = Assert<
  Equal<
    Extract<
      Week,
      {
        status: 'observed';
      }
    >['score'],
    number
  >
>;
export type CarriedNumeric = Assert<
  Equal<
    Extract<
      Week,
      {
        status: 'carriedForward';
      }
    >['score'],
    number
  >
>;
export type MissingNull = Assert<
  Equal<
    Extract<
      Week,
      {
        status: 'unobserved';
      }
    >['score'],
    null
  >
>;
export type WeeklyStates = Assert<Equal<Week['status'], 'observed' | 'carriedForward' | 'unobserved'>>;
