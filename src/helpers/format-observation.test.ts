// @vitest-environment node
import { formatObservation } from './format-observation';

describe('formatObservation', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('should display a winter observation in the local timezone', () => {
    vi.stubEnv('TZ', 'America/New_York');

    expect(formatObservation('2026-01-15T08:00:00Z')).toBe('Jan 15, 2026, 3:00 AM EST');
  });

  it('should display a summer observation with its daylight saving timezone label', () => {
    vi.stubEnv('TZ', 'America/New_York');

    expect(formatObservation('2026-07-15T08:00:00Z')).toBe('Jul 15, 2026, 4:00 AM EDT');
  });
});
