import type { RouteObject } from 'react-router-dom';
import { Stack, Text, Title } from '@mantine/core';
import { ExileCharacterPage } from './components/ExileCharacterPage';
import { App } from './App';
import { HomePage } from './pages/HomePage';
import { WorldOfWarcraftHistoryPage } from './pages/WorldOfWarcraftHistoryPage';
import { WorldOfWarcraftRosterPage } from './pages/WorldOfWarcraftRosterPage';
import { PoeRosterPage } from './pages/PoeRosterPage';
import { Poe2RosterPage } from './pages/Poe2RosterPage';

const Placeholder = ({ title }: { title: string }) => {
  return (
    <Stack>
      <Title order={1}>{title}</Title>
      <Text c="dimmed">{'Under construction.'}</Text>
    </Stack>
  );
};

export const routes: RouteObject[] = [
  {
    children: [
      { element: <HomePage />, index: true },
      { element: <WorldOfWarcraftRosterPage />, path: 'wow' },
      { element: <WorldOfWarcraftHistoryPage />, path: 'wow/characters/:characterId' },
      { element: <PoeRosterPage />, path: 'poe' },
      { element: <ExileCharacterPage game="poe" />, path: 'poe/characters/:characterId' },
      { element: <Poe2RosterPage />, path: 'poe2' },
      { element: <ExileCharacterPage game="poe2" />, path: 'poe2/characters/:characterId' },
      { element: <Placeholder title="Page not found" />, path: '*' },
    ],
    element: <App />,
    path: '/',
  },
];
