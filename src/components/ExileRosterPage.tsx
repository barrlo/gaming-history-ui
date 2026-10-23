import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Anchor, Box, Button, Flex, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import type { ExileRoster } from '../api/exile-types';
import { formatObservation } from '../helpers/format-observation';
import styles from './ExileRosterPage.module.css';

type ExileRosterPageProps = {
  fetchRoster: (signal?: AbortSignal) => Promise<ExileRoster>;
  game: ExileRoster['game'];
  title: string;
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value));
};

export const ExileRosterPage = ({ fetchRoster, game, title }: ExileRosterPageProps) => {
  const roster = useQuery({
    queryFn: ({ signal }) => fetchRoster(signal),
    queryKey: [game, 'roster'],
  });

  return (
    <Stack gap="2rem">
      <Anchor className={styles.home} component={Link} to="/">
        <IconArrowLeft aria-hidden="true" size="1.125rem" />
        {'Home'}
      </Anchor>
      <Box>
        <Title order={1}>{'My characters'}</Title>
        <Text className={styles.subtitle}>{`${title} · League archive`}</Text>
        <Text
          className={styles.note}
        >{`Latest collected builds. Times shown in ${Intl.DateTimeFormat().resolvedOptions().timeZone}.`}</Text>
      </Box>
      {roster.isPending && (
        <Stack aria-label="Loading characters" role="status">
          <Text>{'Loading characters…'}</Text>
          <Skeleton height="8.75rem" />
          <Skeleton height="8.75rem" />
        </Stack>
      )}
      {roster.isError && (
        <Stack align="flex-start" role="alert">
          <Title order={2}>{'Characters could not be loaded'}</Title>
          <Text>{'Your saved characters are still safe. Please try again.'}</Text>
          <Button loading={roster.isFetching} onClick={() => void roster.refetch()}>
            {'Try again'}
          </Button>
        </Stack>
      )}
      {roster.data && (
        <>
          {roster.data.leagues.length === 0 && (
            <Stack>
              <Title order={2}>{'No characters collected yet'}</Title>
              <Text>{'Characters from public temporary leagues will appear after the next collection.'}</Text>
            </Stack>
          )}
          {roster.data.leagues.map((league) => (
            <Box aria-labelledby={`league-${league.id}`} component="section" key={league.id}>
              <Title id={`league-${league.id}`} order={2}>
                {league.name}
              </Title>
              <Text className={styles.note}>
                {league.startAt ? `Started ${formatDate(league.startAt)}` : 'League start date unavailable'}
              </Text>
              <Stack className={styles.characters} component="ul" gap={0}>
                {league.characters.map(({ buildAvailable, character, league, observedAt, tracking }) => (
                  <Flex
                    className={styles.character}
                    component="li"
                    justify="space-between"
                    key={`${character.id}-${league.id}`}
                  >
                    <Box>
                      <Anchor className={styles.name} component={Link} to={`/${game}/characters/${character.id}`}>
                        {character.name}
                      </Anchor>
                      <Text className={styles.identity}>
                        {character.ascendancy.status === 'known'
                          ? `${character.class} · ${character.ascendancy.name}`
                          : character.class}
                      </Text>
                      {character.ascendancy.status === 'unavailable' && (
                        <Text className={styles.note}>{'Ascendancy unavailable'}</Text>
                      )}
                      <Text className={styles.note}>
                        {league.rules.length ? league.rules.map((rule) => rule.name).join(' · ') : 'Regular'}
                        {tracking.status === 'archived' ? ' · Archived' : ''}
                      </Text>
                      <Text className={styles.note}>{`Collected ${formatObservation(observedAt)}`}</Text>
                      {!buildAvailable && <Text className={styles.note}>{'Awaiting first build collection'}</Text>}
                    </Box>
                    <Text className={styles.level}>{`Lv ${character.level}`}</Text>
                  </Flex>
                ))}
              </Stack>
            </Box>
          ))}
          <Text className={styles.note}>
            {'Ended leagues remain in your archive. Permanent and private leagues are not tracked.'}
          </Text>
        </>
      )}
    </Stack>
  );
};
