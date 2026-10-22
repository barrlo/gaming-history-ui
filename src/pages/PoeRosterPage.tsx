import { ExileRosterPage } from '../components/ExileRosterPage';
import { getPoeRoster } from '../api/path-of-exile-service';

export const PoeRosterPage = () => {
  return <ExileRosterPage fetchRoster={getPoeRoster} game="poe" title="Path of Exile" />;
};
