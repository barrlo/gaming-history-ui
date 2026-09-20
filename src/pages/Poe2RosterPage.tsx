import { ExileRosterPage } from '../components/ExileRosterPage';
import { getPoe2Roster } from '../api/path-of-exile-2-service';

export const Poe2RosterPage = () => {
  return <ExileRosterPage fetchRoster={getPoe2Roster} game="poe2" title="Path of Exile 2" />;
};
