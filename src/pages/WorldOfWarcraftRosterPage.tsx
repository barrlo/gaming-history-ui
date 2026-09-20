import { Link } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Anchor, Box, Button, Flex, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { currentScoreQueryOptions } from '../api/current-score-queries';
import { getRoster } from '../api/world-of-warcraft-service';
import type { Character, CurrentScore } from '../api/types';
import styles from './WorldOfWarcraftRosterPage.module.css';

const formatNumber = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);

const compareCharacters = (first: Character, second: Character) =>
  first.name.localeCompare(second.name, 'en', { sensitivity: 'base' }) ||
  first.realm.slug.localeCompare(second.realm.slug, 'en') ||
  first.id.localeCompare(second.id, 'en');

const changeLabel = (current: CurrentScore) => {
  if (current.score === null) {
    return 'No score yet';
  }

  if (current.weeklyChange === null) {
    return 'No baseline yet';
  }

  return `${current.weeklyChange > 0 ? '+' : ''}${formatNumber(current.weeklyChange)}`;
};

const CharacterScores = ({ characters, seasonId }: { characters: Character[]; seasonId: string | null }) => {
  const scores = useQueries({
    queries: characters.map((character) => ({
      ...currentScoreQueryOptions(character.id, seasonId ?? 'none'),
      enabled: seasonId !== null,
    })),
  });
  const rows = characters.map((character, index) => ({ character, query: scores[index] }));
  rows.sort((first, second) => {
    const firstScore = first.query.data?.score ?? -Infinity;
    const secondScore = second.query.data?.score ?? -Infinity;

    return (
      (firstScore === secondScore ? 0 : secondScore - firstScore) ||
      compareCharacters(first.character, second.character)
    );
  });

  return (
    <Box aria-label="Characters" className={styles.roster} component="section">
      <Box aria-hidden="true" className={styles.columnHeadings}>
        <Text>{'Character'}</Text>
        <Text>{'Realm'}</Text>
        <Text>{'Current score'}</Text>
        <Text>{'Weekly change'}</Text>
      </Box>
      {rows.map(({ character, query }) => (
        <Box aria-label={character.name} className={styles.row} component="article" key={character.id}>
          <Box>
            <Title className={styles.characterName} order={2} style={{ color: `var(--wow-${character.classKey})` }}>
              {character.name}
            </Title>
            <Text className={styles.className}>{character.classKey.replaceAll('-', ' ')}</Text>
          </Box>
          <Text className={styles.realm}>{character.realm.name}</Text>
          <Box>
            <Text className={styles.mobileLabel}>{'Current score'}</Text>
            {query.data ? (
              <Text className={styles.scoreValue}>
                {query.data.score === null ? '—' : formatNumber(query.data.score)}
              </Text>
            ) : (
              <Text role="status">
                {seasonId === null ? 'No active season' : query.isPending ? 'Loading score…' : 'Unavailable'}
              </Text>
            )}
          </Box>
          <Box>
            <Text className={styles.mobileLabel}>{'Weekly change'}</Text>
            {query.data && (
              <Text
                className={
                  query.data.weeklyChange !== null && query.data.weeklyChange > 0 ? styles.increase : undefined
                }
              >
                {changeLabel(query.data)}
              </Text>
            )}
            {query.isError && (
              <Stack gap={4}>
                {query.data && (
                  <Text size="xs">
                    {'Could not update score. Showing last fetched score'}
                    {query.data.fetchedAt
                      ? ` · ${new Date(query.data.fetchedAt).toLocaleString('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' })}`
                      : ''}
                    {'.'}
                  </Text>
                )}
                <Button
                  aria-label={`Retry score for ${character.name}`}
                  loading={query.isFetching}
                  onClick={() => void query.refetch()}
                  size="compact-sm"
                  variant="subtle"
                >
                  {'Retry'}
                </Button>
              </Stack>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export const WorldOfWarcraftRosterPage = () => {
  const roster = useQuery({ queryFn: ({ signal }) => getRoster(signal), queryKey: ['wow', 'roster'] });

  return (
    <Stack gap={28}>
      <Anchor className={styles.backLink} component={Link} to="/">
        <IconArrowLeft aria-hidden="true" size={16} />
        {'Home'}
      </Anchor>
      <Box>
        <Title className={styles.title} order={1}>
          {'My characters'}
        </Title>
        <Text className={styles.description}>{'Current Mythic+ scores and weekly progress.'}</Text>
      </Box>
      {roster.isPending && (
        <Stack>
          <Text role="status">{'Loading characters…'}</Text>
          <Skeleton aria-hidden="true" height={280} radius="md" />
        </Stack>
      )}
      {roster.isError && (
        <Stack align="flex-start" role="alert">
          <Text>{'Could not load characters. Please try again.'}</Text>
          <Button loading={roster.isFetching} onClick={() => void roster.refetch()} variant="light">
            {'Retry characters'}
          </Button>
        </Stack>
      )}
      {roster.data && (
        <>
          <Flex align="center" justify="space-between">
            <Text className={styles.season}>{roster.data.season?.name ?? 'Between seasons'}</Text>
            <Text c="var(--site-muted)">{`${roster.data.characters.length} characters`}</Text>
          </Flex>
          {roster.data.characters.length === 0 ? (
            <Box className={styles.empty}>
              <Title order={2}>{'No characters yet'}</Title>
              <Text>{'Tracked characters will appear here when data is available.'}</Text>
            </Box>
          ) : (
            <CharacterScores
              characters={roster.data.characters}
              key={roster.data.season?.id ?? 'none'}
              seasonId={roster.data.season?.id ?? null}
            />
          )}
          <Stack gap={8}>
            <Text c="var(--site-muted)" size="sm">
              {'History snapshots · Tuesdays at 6:00 a.m. Central'}
            </Text>
            <Text c="var(--site-muted)" size="sm">
              {'Current scores may be up to 30 minutes old. Change compares with the last completed week.'}
            </Text>
            {roster.data.dataMode === 'mock' && (
              <Text c="var(--site-muted)" size="xs">
                {'Demo data · All characters, scores, and season information are fictional.'}
              </Text>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
};
