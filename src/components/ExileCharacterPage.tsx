import { useParams } from 'react-router-dom';
import { CharacterBuild } from './CharacterBuild';
import type { ExileRoster } from '../api/exile-types';

export const ExileCharacterPage = ({ game }: { game: ExileRoster['game'] }) => {
  const { characterId = '' } = useParams();

  return <CharacterBuild characterId={characterId} game={game} key={`${game}-${characterId}`} />;
};
