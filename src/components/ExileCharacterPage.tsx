import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Anchor, Button, Group, NativeSelect, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { ExileBuildSections } from './ExileBuildSections';
import type { ExileBuild, ExileRoster, ExileSnapshots } from '../api/exile-types';
import { getPoeBuild, getPoeSnapshot, getPoeSnapshots } from '../api/path-of-exile-service';
import { getPoe2Build, getPoe2Snapshot, getPoe2Snapshots } from '../api/path-of-exile-2-service';
import styles from './ExileCharacterPage.module.css';

const formatObservation = (value: string) => {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    timeZoneName: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const formatIdentity = (character: ExileBuild['character']) => {
  const ascendancy = character.ascendancy.status === 'known' ? ` · ${character.ascendancy.name}` : '';

  return `Level ${character.level} · ${character.class}${ascendancy}`;
};

const formatLeague = (league: ExileBuild['league']) => {
  const rules = league.rules.map((rule) => rule.name).join(' · ') || 'Regular';

  return `${league.name} · ${rules}`;
};

export const ExileCharacterPage = ({ game }: { game: ExileRoster['game'] }) => {
  const { characterId = '' } = useParams();

  return <CharacterBuild characterId={characterId} game={game} key={`${game}-${characterId}`} />;
};

const CharacterBuild = ({ characterId, game }: { characterId: string; game: ExileRoster['game'] }) => {
  const [selected, setSelected] = useState('latest');
  const services =
    game === 'poe'
      ? { build: getPoeBuild, snapshot: getPoeSnapshot, snapshots: getPoeSnapshots }
      : { build: getPoe2Build, snapshot: getPoe2Snapshot, snapshots: getPoe2Snapshots };
  const latest = useQuery({
    queryFn: ({ signal }) => services.build(characterId, signal),
    queryKey: [game, characterId, 'build'],
  });
  const history = useInfiniteQuery({
    getNextPageParam: (page: ExileSnapshots) => page.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }): Promise<ExileSnapshots> => services.snapshots(characterId, pageParam, signal),
    queryKey: [game, characterId, 'snapshots'],
  });
  const snapshot = useQuery({
    enabled: selected !== 'latest',
    queryFn: ({ signal }) => services.snapshot(characterId, selected, signal),
    queryKey: [game, characterId, 'snapshot', selected],
    staleTime: Infinity,
  });
  const selection = selected === 'latest' ? latest : snapshot;
  const build = selection.data?.build;
  const summaries = history.data?.pages.flatMap((page) => page.snapshots) ?? [];

  return (
    <Stack gap="xl">
      <Anchor className={styles.back} component={Link} to={`/${game}`}>
        <IconArrowLeft aria-hidden="true" size="1rem" />
        {'All characters'}
      </Anchor>
      {!build && <Title order={1}>{'Character build'}</Title>}
      {build && (
        <Stack gap="xs">
          <Title order={1}>{build.character.name}</Title>
          <Text c="dimmed">{formatIdentity(build.character)}</Text>
          {build.character.ascendancy.status === 'unavailable' && <Text c="dimmed">{'Ascendancy unavailable'}</Text>}
          <Text c="dimmed" size="sm">
            {formatLeague(build.league)}
          </Text>
          <Text c="dimmed" size="sm">{`Collected ${formatObservation(build.observedAt)}`}</Text>
        </Stack>
      )}
      {latest.data?.tracking.status === 'archived' && (
        <Text>{'Archived character · Saved builds remain available.'}</Text>
      )}
      <Stack gap="xs">
        <NativeSelect
          className={styles.selector}
          data={[
            { label: 'Latest collection', value: 'latest' },
            ...summaries.map((entry) => ({
              label: `${formatObservation(entry.observedAt)} · Level ${entry.level}`,
              value: entry.id,
            })),
          ]}
          label="Build history"
          onChange={(event) => setSelected(event.currentTarget.value)}
          value={selected}
        />
        <Text c="dimmed" size="sm">
          {'Choose a saved date to see the build from that collection.'}
        </Text>
        {selected !== 'latest' && (
          <Button onClick={() => setSelected('latest')} variant="subtle">
            {'Back to Latest'}
          </Button>
        )}
        {history.isPending && <Text role="status">{'Loading saved dates…'}</Text>}
        {history.isError && (
          <Group role="alert">
            <Text>{'Saved dates could not be loaded.'}</Text>
            <Button loading={history.isFetching} onClick={() => void history.refetch()} variant="subtle">
              {'Retry history'}
            </Button>
          </Group>
        )}
        {history.data && summaries.length === 0 && <Text c="dimmed">{'No historical snapshots saved yet.'}</Text>}
        {history.hasNextPage && (
          <Button loading={history.isFetchingNextPage} onClick={() => void history.fetchNextPage()} variant="subtle">
            {'Load older snapshots'}
          </Button>
        )}
      </Stack>
      {selection.isPending && (
        <Stack aria-label="Loading build" role="status">
          <Text>{'Loading build…'}</Text>
          <Skeleton height="12rem" />
        </Stack>
      )}
      {selection.isError && (
        <Stack align="flex-start" role="alert">
          <Title order={2}>{'Build could not be loaded'}</Title>
          <Text>{'The selected collection is unavailable. Try again or choose another saved date.'}</Text>
          <Button loading={selection.isFetching} onClick={() => void selection.refetch()}>
            {'Retry build'}
          </Button>
        </Stack>
      )}
      {build && <ExileBuildSections build={build} key={`${selected}-${build.observedAt}`} />}
    </Stack>
  );
};
