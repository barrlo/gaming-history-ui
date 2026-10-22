import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Anchor, Box, Button, Flex, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { CharacterScores } from '../components/CharacterScores';
import { getRoster } from '../api/world-of-warcraft-service';
import styles from './WorldOfWarcraftRosterPage.module.css';

export const WorldOfWarcraftRosterPage = () => {
  const roster = useQuery({ queryFn: ({ signal }) => getRoster(signal), queryKey: ['wow', 'roster'] });

  return (
    <Stack gap="1.75rem">
      <Anchor className={styles.backLink} component={Link} to="/">
        <IconArrowLeft aria-hidden="true" size="1rem" />
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
          <Skeleton aria-hidden="true" height="17.5rem" radius="md" />
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
          <Stack gap="0.5rem">
            <Text c="var(--site-muted)" size="sm">
              {'History snapshots · Tuesdays at 6:00 a.m. Central'}
            </Text>
            <Text c="var(--site-muted)" size="sm">
              {'Current scores may be up to 30 minutes old. Change compares with the last completed week.'}
            </Text>
          </Stack>
        </>
      )}
    </Stack>
  );
};
