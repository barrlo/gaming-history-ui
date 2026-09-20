import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Anchor, Box, Button, Flex, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import type { ExileRoster } from '../api/exile-types';
import styles from './ExileRosterPage.module.css';

type ExileRosterPageProps = {
  fetchRoster: (signal?: AbortSignal) => Promise<ExileRoster>;
  game: ExileRoster['game'];
  title: string;
};

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'America/Chicago' }).format(new Date(value));
};

const formatObservation = (value: string) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Chicago',
  }).format(new Date(value));
};

export const ExileRosterPage = ({ fetchRoster, game, title }: ExileRosterPageProps) => {
  const roster = useQuery({
    queryFn: ({ signal }) => fetchRoster(signal),
    queryKey: [game, 'roster'],
  });

  return (
    <Stack gap={32}>
      <Anchor className={styles.home} component={Link} to="/">
        <IconArrowLeft aria-hidden="true" size={18} />
        {'Home'}
      </Anchor>
      <Box>
        <Title order={1}>{'My characters'}</Title>
        <Text className={styles.subtitle}>{`${title} · League archive`}</Text>
        <Text className={styles.note}>{'Latest scheduled collections. All times shown in Central time.'}</Text>
      </Box>
      {roster.isPending && (
        <Stack aria-label="Loading characters" role="status">
          <Text>{'Loading characters…'}</Text>
          <Skeleton height={140} />
          <Skeleton height={140} />
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
          {roster.data.groups.length === 0 && (
            <Stack>
              <Title order={2}>{'No characters collected yet'}</Title>
              <Text>{'Characters from public temporary leagues will appear after the next collection.'}</Text>
            </Stack>
          )}
          {roster.data.groups.map((group) => (
            <Box aria-labelledby={`league-${group.id}`} component="section" key={group.id}>
              <Title id={`league-${group.id}`} order={2}>
                {group.name}
              </Title>
              <Text className={styles.note}>
                {group.startAt ? `Started ${formatDate(group.startAt)}` : 'League start date unavailable'}
              </Text>
              <Stack className={styles.characters} component="ul" gap={0}>
                {group.characters.map(({ buildAvailable, character, league, observedAt, tracking }) => (
                  <Flex
                    className={styles.character}
                    component="li"
                    justify="space-between"
                    key={`${character.id}-${league.id}`}
                  >
                    <Box>
                      <Text className={styles.name}>{character.name}</Text>
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
                      <Text className={styles.note}>{`Collected ${formatObservation(observedAt)} CT`}</Text>
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
