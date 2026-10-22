import { ReferenceDot } from 'recharts';
import { LineChart } from '@mantine/charts';
import { Box, Group, Text, Title, VisuallyHidden } from '@mantine/core';
import { WowHistoryTooltip } from './WowHistoryTooltip';
import type { CurrentScore, Week } from '../api/types';
import styles from './WowHistoryChart.module.css';

type Props = {
  current: CurrentScore | undefined;
  weeks: Week[];
};

export const WowHistoryChart = ({ current, weeks }: Props) => {
  const latest = weeks.at(-1);
  const hasCurrent = current?.score !== null && current?.score !== undefined;
  const data = weeks.map((week) => ({
    current: hasCurrent && week === latest ? week.score : null,
    label: `W${week.index}`,
    weekly: week.score,
  }));

  if (hasCurrent) {
    data.push({ current: current.score, label: 'Current', weekly: null });
  }

  const axisMaximum =
    Math.ceil(Math.max(1, ...data.map((point) => Math.max(point.current ?? 0, point.weekly ?? 0))) / 1000) * 1000;
  const hasScores = hasCurrent || weeks.some((week) => week.score !== null);

  return (
    <Box aria-label="Mythic+ score history" className={styles.panel} component="section">
      <Title order={2} size="h3">
        {'Mythic+ score'}
      </Title>
      <Text c="var(--site-muted)" mb="lg" size="xs">
        {'Saved weekly scores + current'}
      </Text>
      {hasScores ? (
        <LineChart
          className={styles.chart}
          connectNulls={false}
          curveType="linear"
          data={data}
          dataKey="label"
          gridAxis="x"
          gridColor="var(--site-border)"
          gridProps={{ strokeDasharray: '0' }}
          h="16rem"
          lineProps={(series) => ({
            dot: series.name === 'current' ? false : { fill: 'var(--site-accent)', r: 3 },
            isAnimationActive: false,
          })}
          series={[
            { color: 'var(--site-accent)', label: 'Saved weekly score', name: 'weekly' },
            { color: 'var(--site-accent)', label: 'Current', name: 'current', strokeDasharray: '5 4' },
          ]}
          strokeWidth={2}
          tooltipProps={{ content: <WowHistoryTooltip current={current} weeks={weeks} /> }}
          xAxisProps={{ interval: 'preserveStartEnd', minTickGap: 12 }}
          yAxisProps={{
            domain: [0, axisMaximum],
            ticks: Array.from({ length: axisMaximum / 1000 + 1 }, (_, index) => index * 1000),
            width: 48,
          }}
        >
          {hasCurrent && (
            <ReferenceDot
              fill="var(--site-surface)"
              r={6}
              stroke="var(--site-accent)"
              strokeWidth={2}
              x="Current"
              y={current.score!}
            />
          )}
        </LineChart>
      ) : (
        <Text className={styles.empty} role="status">
          {'No scores observed yet. Your history will appear after the first observation.'}
        </Text>
      )}
      <Group gap="md" mt="md">
        <Text className={styles.legend} size="xs">
          <Box aria-hidden="true" className={styles.savedDot} component="span" />
          {'Saved weekly score'}
        </Text>
        <Text className={styles.legend} size="xs">
          <Box aria-hidden="true" className={styles.currentDot} component="span" />
          {'Current'}
        </Text>
      </Group>
      <VisuallyHidden>
        <ul aria-label="Score observations">
          {weeks.map((week) => (
            <li key={week.index}>
              {`Week ${week.index}: ${week.score === null ? 'not observed' : week.score.toLocaleString('en-US')}${week.status === 'carriedForward' ? ', carried forward from the previous observation' : ''}.`}
            </li>
          ))}
          {hasCurrent && <li>{`Current: ${current.score!.toLocaleString('en-US')}.`}</li>}
        </ul>
      </VisuallyHidden>
    </Box>
  );
};
