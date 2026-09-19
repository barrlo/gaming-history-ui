import { Route, Routes } from 'react-router-dom';
import { Stack, Text, Title } from '@mantine/core';
import { SiteLayout } from './components/SiteLayout';
import { HomePage } from './pages/HomePage';
import './styles.css';

const Placeholder = ({ title }: { title: string }) => {
  return (
    <Stack>
      <Title order={1}>{title}</Title>
      <Text c="dimmed">{'Under construction.'}</Text>
    </Stack>
  );
};

export const App = () => {
  return (
    <SiteLayout>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<Placeholder title="World of Warcraft" />} path="/wow" />
        <Route element={<Placeholder title="Character history" />} path="/wow/characters/:characterId" />
        <Route element={<Placeholder title="Path of Exile" />} path="/poe" />
        <Route element={<Placeholder title="Path of Exile 2" />} path="/poe2" />
        <Route element={<Placeholder title="Page not found" />} path="*" />
      </Routes>
    </SiteLayout>
  );
};
