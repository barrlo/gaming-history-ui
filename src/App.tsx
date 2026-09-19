import { Outlet } from 'react-router-dom';
import { SiteLayout } from './components/SiteLayout';
import './styles.css';

export const App = () => {
  return (
    <SiteLayout>
      <Outlet />
    </SiteLayout>
  );
};
