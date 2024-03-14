import {CurrentSeasonScore} from '@/types/current-season-score';
import {SeasonScore} from '@/types/season-score';

export type WoWCharacter = {
    id: number | string;
    name: string;
    mythicPlusScoresBySeason: SeasonScore[];
    mythicPlusScoresCurrentSeason: CurrentSeasonScore[];
    itemLevel: number;
};
