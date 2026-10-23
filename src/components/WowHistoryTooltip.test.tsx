import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/render';
import { WowHistoryTooltip } from './WowHistoryTooltip';
import { wowHistories } from '../mocks/wow-history';
import { wowCurrentScores } from '../mocks/wow-roster';

describe('WoW history tooltip', () => {
  it('should describe the carried-forward weekly point without mislabeling the connector as current', () => {
    renderWithProviders(
      <WowHistoryTooltip active current={wowCurrentScores[0]} label="W5" weeks={wowHistories[0].weeks} />,
    );

    expect(screen.getByText('Week 5')).toBeInTheDocument();
    expect(screen.getByText('1,920')).toBeInTheDocument();
    expect(screen.getByText('Carried forward from the previous observation')).toBeInTheDocument();
    expect(screen.getByText(/^Observed /)).toBeInTheDocument();
    expect(screen.queryByText('Current')).not.toBeInTheDocument();
  });

  it('should display the current score and actual observation time', () => {
    renderWithProviders(
      <WowHistoryTooltip active current={wowCurrentScores[0]} label="Current" weeks={wowHistories[0].weeks} />,
    );

    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('2,540')).toBeInTheDocument();
    expect(screen.getByText(/^Observed /)).toBeInTheDocument();
  });

  it.each([
    { active: false, label: 'W1' },
    { active: true, label: 'W100' },
    { active: true, label: 'Current' },
  ])('should omit inactive or unknown observations', (props) => {
    renderWithProviders(<WowHistoryTooltip {...props} current={undefined} weeks={wowHistories[0].weeks} />);

    expect(screen.queryByText(/^Observed /)).not.toBeInTheDocument();
    expect(screen.queryByText('Current')).not.toBeInTheDocument();
  });

  it('should omit a week with no observation', () => {
    renderWithProviders(<WowHistoryTooltip active current={undefined} label="W1" weeks={wowHistories[1].weeks} />);

    expect(screen.queryByText('Week 1')).not.toBeInTheDocument();
  });
});
