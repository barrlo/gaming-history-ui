import { Paper, Text } from '@mantine/core';
import type { CurrentScore, Week } from '../api/types';

type Props = {
  active?: boolean;
  current: CurrentScore | undefined;
  label?: string | number;
  weeks: Week[];
};

export const WowHistoryTooltip = ({ active, current, label, weeks }: Props) => {
  const week = weeks.find((entry) => `W${entry.index}` === label);
  const score = label === 'Current' ? current?.score : week?.score;
  const observedAt = label === 'Current' ? current?.fetchedAt : week?.sourceObservedAt;
  const observedTime = observedAt ? new Date(observedAt).toLocaleString('en-US', { timeZoneName: 'short' }) : null;

  if (!active || score === null || score === undefined) {
    return null;
  }

  return (
    <Paper bg="var(--site-surface)" p="sm" role="tooltip" shadow="md" withBorder>
      <Text fw={600}>{label === 'Current' ? 'Current' : `Week ${week!.index}`}</Text>
      <Text>{score.toLocaleString('en-US', { maximumFractionDigits: 1 })}</Text>
      {week?.status === 'carriedForward' && <Text size="xs">{'Carried forward from the previous observation'}</Text>}
      {observedTime && (
        <Text c="var(--site-muted)" size="xs">
          {`Observed ${observedTime}`}
        </Text>
      )}
    </Paper>
  );
};
