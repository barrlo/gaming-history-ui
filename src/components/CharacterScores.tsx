import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Anchor, Box, Button, Stack, Text, Title } from '@mantine/core';
import { currentScoreQueryOptions } from '../api/current-score-queries';
import type { Character, CurrentScore } from '../api/types';
import styles from './CharacterScores.module.css';

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

export const CharacterScores = ({ characters, seasonId }: { characters: Character[]; seasonId: string | null }) => {
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
              <Anchor c="inherit" component={Link} inherit to={`/wow/characters/${encodeURIComponent(character.id)}`}>
                {character.name}
              </Anchor>
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
              <Stack gap="0.25rem">
                {query.data && (
                  <Text size="xs">
                    {'Could not update score. Showing last fetched score'}
                    {query.data.fetchedAt
                      ? ` · ${new Date(query.data.fetchedAt).toLocaleString('en-US', { timeZoneName: 'short' })}`
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
