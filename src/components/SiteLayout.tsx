import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ActionIcon, Box, Burger, Drawer, Flex, Group, Stack, Text, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useNavigation } from '../state/navigation';
import styles from './SiteLayout.module.css';

const links = [
  { label: 'Home', path: '/' },
  { label: 'World of Warcraft', path: '/wow' },
  { label: 'Path of Exile', path: '/poe' },
  { label: 'Path of Exile 2', path: '/poe2' },
];

export const SiteLayout = ({ children }: { children: ReactNode }) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { close, opened, toggle } = useNavigation();

  return (
    <Box className={styles.siteLayout}>
      <Box className={styles.skipLink} component="a" href="#main-content">
        {'Skip to content'}
      </Box>
      <Flex className={styles.siteHeader} component="header">
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
          <Text className={styles.siteBrand}>{'Gaming History'}</Text>
        </Group>
        <Group
          aria-label="Main navigation"
          className={styles.desktopNavigation}
          component="nav"
          gap={48}
          visibleFrom="md"
          wrap="nowrap"
        >
          {links.map(({ label, path }) => (
            <NavLink aria-label={label} className={styles.navigationLink} end={path === '/'} key={path} to={path}>
              {label}
            </NavLink>
          ))}
        </Group>
        <ActionIcon
          aria-label={`Switch to ${colorScheme === 'dark' ? 'light' : 'dark'} theme`}
          className={styles.themeToggle}
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
      </Flex>
      <Drawer
        classNames={{
          body: styles.navigationDrawer,
          content: styles.navigationDrawer,
          header: styles.navigationDrawer,
        }}
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
            <NavLink
              className={`${styles.navigationLink} ${styles.drawerLink}`}
              end={path === '/'}
              key={path}
              onClick={close}
              to={path}
            >
              {label}
            </NavLink>
          ))}
        </Stack>
      </Drawer>
      <Box className={styles.siteContent} component="main" id="main-content" tabIndex={-1}>
        {children}
      </Box>
    </Box>
  );
};
