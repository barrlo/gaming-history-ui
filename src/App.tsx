import { Link, NavLink, Route, Routes } from 'react-router-dom';
import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  Container,
  Drawer,
  Group,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useNavigation } from './state/navigation';

const links = [
  ['/', 'Home'],
  ['/wow', 'World of Warcraft'],
  ['/poe', 'Path of Exile'],
  ['/poe2', 'Path of Exile 2'],
];

const Placeholder = ({ title }: { title: string }) => {
  return (
    <Stack>
      <Title order={1}>{title}</Title>
      <Text c="dimmed">{'Under construction.'}</Text>
    </Stack>
  );
};

export const App = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { opened, toggle, close } = useNavigation();
  const nav = links.map(([path, label]) => (
    <Button component={NavLink} key={path} onClick={close} to={path} variant="subtle">
      {label}
    </Button>
  ));

  return (
    <AppShell header={{ height: 72 }} padding="md">
      <AppShell.Header>
        <Group h="100%" justify="space-between" px="lg" wrap="nowrap">
          <Group wrap="nowrap">
            <Burger
              aria-label={opened ? 'Close navigation' : 'Open navigation'}
              hiddenFrom="md"
              onClick={toggle}
              opened={opened}
            />
            <Text c="var(--mantine-color-text)" fw={700}>
              {'Gaming History'}
            </Text>
          </Group>
          <Group gap={48} visibleFrom="md" wrap="nowrap">
            {nav}
          </Group>
          <ActionIcon
            aria-label={`Switch to ${colorScheme === 'dark' ? 'light' : 'dark'} theme`}
            onClick={toggleColorScheme}
            variant="subtle"
          >
            {colorScheme === 'dark' ? (
              <IconSun aria-hidden="true" size={20} stroke={1.75} />
            ) : (
              <IconMoon aria-hidden="true" size={20} stroke={1.75} />
            )}
          </ActionIcon>
        </Group>
      </AppShell.Header>
      <Drawer onClose={close} opened={opened} position="left" title="Navigation">
        <Stack>{nav}</Stack>
      </Drawer>
      <AppShell.Main>
        <Container py="xl" size="lg">
          <Routes>
            <Route
              element={
                <Stack>
                  <Title order={1}>{'Your gaming history'}</Title>
                  <Text c="dimmed">{'A personal record of your characters and seasons.'}</Text>
                  <Text size="sm">
                    {'Scaffold preview — approved screen designs will be implemented in the next checkpoint.'}
                  </Text>
                  <Button component={Link} to="/wow" w="fit-content">
                    {'Explore World of Warcraft'}
                  </Button>
                </Stack>
              }
              path="/"
            />
            <Route element={<Placeholder title="World of Warcraft" />} path="/wow" />
            <Route element={<Placeholder title="Character history" />} path="/wow/characters/:characterId" />
            <Route element={<Placeholder title="Path of Exile" />} path="/poe" />
            <Route element={<Placeholder title="Path of Exile 2" />} path="/poe2" />
            <Route element={<Placeholder title="Page not found" />} path="*" />
          </Routes>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};
