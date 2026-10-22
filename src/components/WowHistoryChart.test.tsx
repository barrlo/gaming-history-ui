// @vitest-environment jsdom
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../test/render';
import { WowHistoryChart } from './WowHistoryChart';
import { wowHistories } from '../mocks/wow-history';
import { wowCurrentScores } from '../mocks/wow-roster';

describe('WoW history chart', () => {
  it('should present server-projected observations separately from the current point', () => {
    renderWithProviders(<WowHistoryChart current={wowCurrentScores[0]} weeks={wowHistories[0].weeks} />);
    const observations = within(screen.getByRole('list', { name: 'Score observations' })).getAllByRole('listitem');

    expect(observations).toHaveLength(8);
    expect(observations[0]).toHaveTextContent('Week 1: 820.');
    expect(observations[4]).toHaveTextContent('Week 5: 1,920, carried forward from the previous observation.');
    expect(observations[6]).toHaveTextContent('Week 7: 2,362.');
    expect(observations[7]).toHaveTextContent('Current: 2,540.');
  });

  it('should retain unknown weeks without inventing a score or current point', () => {
    renderWithProviders(<WowHistoryChart current={undefined} weeks={wowHistories[1].weeks} />);

    expect(screen.getByText(/No scores observed yet/)).toBeInTheDocument();
    expect(screen.getByText('Week 1: not observed.')).toBeInTheDocument();
    expect(screen.queryByText(/^Current:/)).not.toBeInTheDocument();
  });

  it('should show a current-only first observation with no saved weeks', () => {
    renderWithProviders(<WowHistoryChart current={wowCurrentScores[0]} weeks={[]} />);

    expect(screen.getByText('Current: 2,540.')).toBeInTheDocument();
    expect(screen.queryByText(/No scores observed yet/)).not.toBeInTheDocument();
  });
});
