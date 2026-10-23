import type { ReactNode } from 'react';
import { useId, useState } from 'react';
import { Box, Button, Stack, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import styles from './BuildSection.module.css';

type SectionProps = {
  availability: string;
  children: ReactNode;
  isEmpty: boolean;
  isInitiallyOpen?: boolean;
  title: string;
};

export const BuildSection = ({ availability, children, isEmpty, isInitiallyOpen = false, title }: SectionProps) => {
  const contentId = useId();
  const isMobile = useMediaQuery('(max-width: 61.99em)');
  const [isOpen, setIsOpen] = useState(isInitiallyOpen);

  const isUnavailable = availability === 'unavailable';
  const isConfirmedEmpty = isEmpty && availability === 'available';
  const hasContent = !isUnavailable && !isEmpty;

  return (
    <Box aria-label={title} className={styles.section} component="section">
      {isMobile ? (
        <Button
          aria-controls={contentId}
          aria-expanded={isOpen}
          className={styles.sectionButton}
          fullWidth
          justify="space-between"
          onClick={() => setIsOpen(!isOpen)}
          rightSection={isOpen ? <IconChevronDown aria-hidden="true" /> : <IconChevronRight aria-hidden="true" />}
          variant="transparent"
        >
          {title}
        </Button>
      ) : (
        <Title order={2}>{title}</Title>
      )}
      {(!isMobile || isOpen) && (
        <Stack gap="md" id={contentId} mt="md">
          {availability === 'partial' && (
            <Text c="dimmed">{'Some data was unavailable during this collection. Only recorded data is shown.'}</Text>
          )}
          {isUnavailable && <Text c="dimmed">{'Unavailable for this collection.'}</Text>}
          {isConfirmedEmpty && <Text c="dimmed">{'None recorded for this collection.'}</Text>}
          {hasContent && children}
        </Stack>
      )}
    </Box>
  );
};
