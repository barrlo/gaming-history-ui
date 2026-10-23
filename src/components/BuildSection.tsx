import type { ReactNode } from 'react';
import { useId, useState } from 'react';
import { Box, Button, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import styles from './BuildSection.module.css';

type SectionProps = {
  availability: string;
  children: ReactNode;
  empty: boolean;
  initiallyOpen?: boolean;
  title: string;
};

export const BuildSection = ({ availability, children, empty, initiallyOpen = false, title }: SectionProps) => {
  const contentId = useId();
  const mobile = useMediaQuery('(max-width: 61.99em)');
  const [opened, setOpened] = useState(initiallyOpen);

  return (
    <Box aria-label={title} className={styles.section} component="section">
      {mobile ? (
        <Button
          aria-controls={contentId}
          aria-expanded={opened}
          className={styles.sectionButton}
          fullWidth
          justify="space-between"
          onClick={() => setOpened(!opened)}
          rightSection={opened ? <IconChevronDown aria-hidden="true" /> : <IconChevronRight aria-hidden="true" />}
          variant="transparent"
        >
          {title}
        </Button>
      ) : (
        <Title order={2}>{title}</Title>
      )}
      {(!mobile || opened) && (
        <Stack gap="md" id={contentId} mt="md">
          {availability === 'partial' && (
            <Text c="dimmed">{'Some data was unavailable during this collection. Only recorded data is shown.'}</Text>
          )}
          {availability === 'unavailable' ? (
            <Text c="dimmed">{'Unavailable for this collection.'}</Text>
          ) : empty && availability === 'available' ? (
            <Text c="dimmed">{'None recorded for this collection.'}</Text>
          ) : (
            !empty && children
          )}
        </Stack>
      )}
    </Box>
  );
};
