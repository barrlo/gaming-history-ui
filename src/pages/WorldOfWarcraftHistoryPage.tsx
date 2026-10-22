import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Anchor, Box, Button, SimpleGrid, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { WowHistoryChart } from '../components/WowHistoryChart';
import { currentScoreQueryOptions } from '../api/current-score-queries';
import { getHistory } from '../api/world-of-warcraft-service';
import styles from './WorldOfWarcraftHistoryPage.module.css';

const formatScore = (score: number) => score.toLocaleString('en-US', { maximumFractionDigits: 1 });

export const WorldOfWarcraftHistoryPage = () => {
  const { characterId = '' } = useParams();
  const history = useQuery({
    queryFn: async ({ signal }) => {
      const result = await getHistory(characterId, signal);

      if (result.character.id !== characterId) {
        throw new Error('The history does not match this character.');
      }

      return result;
    },
    queryKey: ['wow', 'history', characterId, 'current'],
  });
  const season = history.data?.season;
  const current = useQuery({
    ...currentScoreQueryOptions(characterId, season?.id ?? 'none'),
    enabled: !!season,
  });
  const data = history.data;
  const score = current.data;
  const baseline = score ? score.baselineScore : data?.weeklySummary.latestScore;
  const notFound = isAxiosError(history.error) && history.error.response?.status === 404;

  return (
    <Stack gap="xl">
      <Anchor className={styles.backLink} component={Link} to="/wow">
        <IconArrowLeft aria-hidden="true" size="1rem" />
        {'All characters'}
      </Anchor>
      <Box>
        <Title
          className={styles.name}
          order={1}
          style={data ? { color: `var(--wow-${data.character.classKey})` } : undefined}
        >
          {data?.character.name ?? 'Character history'}
        </Title>
        {data && (
          <Text
            className={styles.identity}
          >{`${data.character.classKey.replaceAll('-', ' ')} · ${data.character.realm.name}`}</Text>
        )}
        {data && (
          <Text c="var(--site-muted)" mt="sm" size="xs">
            {season?.name ?? 'Between seasons'}
          </Text>
        )}
      </Box>
      {history.isPending && (
        <Stack>
          <Text role="status">{'Loading history…'}</Text>
          <Skeleton aria-hidden="true" height="22rem" />
        </Stack>
      )}
      {history.isError && (
        <Stack align="flex-start" role="alert">
          <Text>{notFound ? 'Character not found.' : 'Could not load history. Please try again.'}</Text>
          {!notFound && (
            <Button loading={history.isFetching} onClick={() => void history.refetch()} variant="light">
              {'Retry history'}
            </Button>
          )}
        </Stack>
      )}
      {data && !season && (
        <Text role="status">{'There is no active season. Check back when the next season begins.'}</Text>
      )}
      {data && season && (
        <>
          <SimpleGrid cols={2} spacing="lg">
            <Box>
              <Text className={styles.label}>{'Current score'}</Text>
              {score ? (
                <Text className={styles.score}>{score.score === null ? 'No score yet' : formatScore(score.score)}</Text>
              ) : (
                <Text role="status">{current.isPending ? 'Fetching current score…' : 'Current score unavailable'}</Text>
              )}
            </Box>
            <Box aria-label="Weekly comparison" role="group">
              <Text className={styles.label} visibleFrom="sm">
                {'Change since last completed week'}
              </Text>
              <Text className={styles.label} hiddenFrom="sm">
                {'Since last week'}
              </Text>
              <Text
                c={score && score.weeklyChange !== null && score.weeklyChange > 0 ? 'var(--site-available)' : undefined}
                className={styles.change}
              >
                {score?.weeklyChange === null || score?.weeklyChange === undefined
                  ? '—'
                  : `${score.weeklyChange > 0 ? '+' : ''}${formatScore(score.weeklyChange)}`}
              </Text>
              {score && score.baselineScore === null && (
                <Text c="var(--site-muted)" size="sm">
                  {'No completed-week baseline yet.'}
                </Text>
              )}
            </Box>
          </SimpleGrid>
          {score?.fetchedAt && (
            <Text
              c="var(--site-muted)"
              size="sm"
            >{`Fetched ${new Date(score.fetchedAt).toLocaleString('en-US', { timeZoneName: 'short' })}`}</Text>
          )}
          {current.isError && (
            <Text role="alert">
              {score
                ? 'Could not update current score. Showing the last fetched score.'
                : 'Could not fetch current score. Saved weekly history is still available.'}
            </Text>
          )}
          <WowHistoryChart current={score} weeks={data.weeks} />
          <Stack align="flex-start" gap="sm">
            <Text>{`Last completed week: ${baseline === null || baseline === undefined ? 'No baseline yet' : formatScore(baseline)}`}</Text>
            <Text c="var(--site-muted)" size="xs">
              {'Current score may be cached for up to 30 minutes.'}
            </Text>
            <Button loading={current.isFetching} onClick={() => void current.refetch()} variant="light">
              {current.isError ? 'Retry current score' : 'Refresh current score'}
            </Button>
            <Text c="var(--site-muted)" mt="sm" size="xs">
              {'Weekly snapshots · Tuesday 6 a.m. Central'}
            </Text>
          </Stack>
        </>
      )}
    </Stack>
  );
};
