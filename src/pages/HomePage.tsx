import { Link } from 'react-router-dom';
import { Button, Text, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';

const games = [
  {
    action: 'View characters',
    available: true,
    description: 'Characters, Mythic+ scores, and a season of progress.',
    path: '/wow',
    title: 'World of Warcraft',
  },
  {
    action: 'View page',
    available: false,
    description: 'A new chapter is on its way.',
    path: '/poe',
    title: 'Path of Exile',
  },
  {
    action: 'View page',
    available: false,
    description: 'Another adventure to follow.',
    path: '/poe2',
    title: 'Path of Exile 2',
  },
];

export const HomePage = () => {
  return (
    <>
      <section aria-labelledby="home-title" className="home-intro">
        <Text className="eyebrow">{'A personal gaming journal'}</Text>
        <Title className="home-title" id="home-title" order={1}>
          {'Every character. Every season.'}
        </Title>
        <Text className="home-description">
          {'A place to follow my progress across the games I play.'}
          <br />
          {'Start with World of Warcraft and explore the journey week by week.'}
        </Text>
      </section>
      <section aria-labelledby="games-title">
        <Title className="section-title" id="games-title" order={2}>
          {'Explore the games'}
        </Title>
        <div className="game-grid">
          {games.map(({ action, available, description, path, title }) => (
            <article aria-label={title} className="game-card" key={path}>
              <Text className={`game-status ${available ? 'available' : ''}`}>
                {available ? 'Available' : 'Under construction'}
              </Text>
              <Title className="game-title" order={3}>
                {title}
              </Title>
              <Text className="game-description">
                {description}
                {!available && <span className="tracking-note">{'Tracking details are still taking shape.'}</span>}
              </Text>
              <Button
                className={`game-action ${available ? 'primary-action' : ''}`}
                component={Link}
                fullWidth
                justify="space-between"
                rightSection={<IconArrowRight aria-hidden="true" size={18} />}
                to={path}
                variant="subtle"
              >
                {action}
              </Button>
            </article>
          ))}
        </div>
      </section>
      <footer className="home-footer">
        <Text className="footer-title">{'Made for the journey'}</Text>
        <Text className="footer-description">
          {'A personal archive to share with friends, one snapshot at a time.'}
        </Text>
      </footer>
    </>
  );
};
