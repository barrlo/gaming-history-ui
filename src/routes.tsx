import type { RouteObject } from 'react-router-dom';
import { Stack, Text, Title } from '@mantine/core';
import { App } from './App';
import { HomePage } from './pages/HomePage';
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
      { element: <Placeholder title="World of Warcraft" />, path: 'wow' },
      { element: <Placeholder title="Character history" />, path: 'wow/characters/:characterId' },
      { element: <PoeRosterPage />, path: 'poe' },
      { element: <Poe2RosterPage />, path: 'poe2' },
      { element: <Placeholder title="Page not found" />, path: '*' },
    ],
    element: <App />,
    path: '/',
  },
];
