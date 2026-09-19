import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ActionIcon, Burger, Drawer, Group, Stack, Text, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useNavigation } from '../state/navigation';

const links = [
  { label: 'Home', path: '/', shortLabel: 'Home' },
  { label: 'World of Warcraft', path: '/wow', shortLabel: 'World of Warcraft' },
  { label: 'Path of Exile', path: '/poe', shortLabel: 'PoE' },
  { label: 'Path of Exile 2', path: '/poe2', shortLabel: 'PoE2' },
];

export const SiteLayout = ({ children }: { children: ReactNode }) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { close, opened, toggle } = useNavigation();

  return (
    <div className="site-layout">
      <a className="skip-link" href="#main-content">
        {'Skip to content'}
      </a>
      <header className="site-header">
        <Group gap={16} wrap="nowrap">
          <Burger
            aria-controls="mobile-navigation"
            aria-expanded={opened}
            aria-label={opened ? 'Close navigation' : 'Open navigation'}
            hiddenFrom="md"
            onClick={toggle}
            opened={opened}
            size="sm"
            style={{ height: 44, width: 44 }}
          />
          <Text className="site-brand">{'Gaming History'}</Text>
        </Group>
        <Group
          aria-label="Main navigation"
          className="desktop-navigation"
          component="nav"
          gap={48}
          visibleFrom="md"
          wrap="nowrap"
        >
          {links.map(({ label, path, shortLabel }) => (
            <NavLink aria-label={label} className="navigation-link" end={path === '/'} key={path} to={path}>
              {shortLabel}
            </NavLink>
          ))}
        </Group>
        <ActionIcon
          aria-label={`Switch to ${colorScheme === 'dark' ? 'light' : 'dark'} theme`}
          className="theme-toggle"
          onClick={toggleColorScheme}
          radius="md"
          size={44}
          variant="subtle"
        >
          {colorScheme === 'dark' ? (
            <IconSun aria-hidden="true" size={24} stroke={1.7} />
          ) : (
            <IconMoon aria-hidden="true" size={24} stroke={1.7} />
          )}
        </ActionIcon>
      </header>
      <Drawer
        classNames={{ body: 'navigation-drawer', content: 'navigation-drawer', header: 'navigation-drawer' }}
        closeButtonProps={{ 'aria-label': 'Close navigation' }}
        id="mobile-navigation"
        onClose={close}
        opened={opened}
        position="left"
        size={300}
        title="Navigation"
      >
        <Stack aria-label="Mobile navigation" component="nav" gap="sm">
          {links.map(({ label, path }) => (
            <NavLink className="navigation-link drawer-link" end={path === '/'} key={path} onClick={close} to={path}>
              {label}
            </NavLink>
          ))}
        </Stack>
      </Drawer>
      <main className="site-content" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
};
