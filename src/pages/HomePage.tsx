import { Link } from 'react-router-dom';
import { Box, Button, Flex, SimpleGrid, Text, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import styles from './HomePage.module.css';

const games = [
  {
    action: 'View characters',
    available: true,
    description: 'Characters, Mythic+ scores, and a season of progress.',
    path: '/wow',
    title: 'World of Warcraft',
  },
  {
    action: 'View characters',
    available: true,
    description: 'Characters, league archives, and collected builds.',
    path: '/poe',
    title: 'Path of Exile',
  },
  {
    action: 'View characters',
    available: true,
    description: 'Characters and collected builds, grouped by league.',
    path: '/poe2',
    title: 'Path of Exile 2',
  },
];

export const HomePage = () => {
  return (
    <>
      <Box aria-labelledby="home-title" className={styles.homeIntro} component="section">
        <Text className={styles.eyebrow}>{'A personal gaming journal'}</Text>
        <Title className={styles.homeTitle} id="home-title" order={1}>
          {'Every character. Every season.'}
        </Title>
        <Text className={styles.homeDescription}>
          {'A place to follow my progress across the games I play.'}
          <br />
          {'Start with World of Warcraft and explore the journey week by week.'}
        </Text>
      </Box>
      <Box aria-labelledby="games-title" component="section">
        <Title className={styles.sectionTitle} id="games-title" order={2}>
          {'Explore the games'}
        </Title>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing={{ base: 20, md: 24 }}>
          {games.map(({ action, available, description, path, title }) => (
            <Flex aria-label={title} className={styles.gameCard} component="article" direction="column" key={path}>
              <Text className={`${styles.gameStatus} ${available ? styles.available : ''}`}>
                {available ? 'Available' : 'Under construction'}
              </Text>
              <Title className={styles.gameTitle} order={3}>
                {title}
              </Title>
              <Text className={styles.gameDescription}>
                {description}
                {!available && (
                  <Box className={styles.trackingNote} component="span">
                    {'Tracking details are still taking shape.'}
                  </Box>
                )}
              </Text>
              <Button
                className={`${styles.gameAction} ${available ? styles.primaryAction : ''}`}
                component={Link}
                fullWidth
                justify="space-between"
                rightSection={<IconArrowRight aria-hidden="true" size={18} />}
                to={path}
                variant="subtle"
              >
                {action}
              </Button>
            </Flex>
          ))}
        </SimpleGrid>
      </Box>
      <Box className={styles.homeFooter} component="footer">
        <Text className={styles.footerTitle}>{'Made for the journey'}</Text>
        <Text className={styles.footerDescription}>
          {'A personal archive to share with friends, one snapshot at a time.'}
        </Text>
      </Box>
    </>
  );
};
