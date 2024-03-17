import {WoWCharacter} from '@/types/wow-character';
import {WoWCharacterDetails} from '@/types/wow-character-details';

export const getWowCharacters = async (): Promise<WoWCharacter[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wow/characters`);
    return await response.json();
};

export const getWowCharacterDetails = async (id: string): Promise<WoWCharacterDetails> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wow/character/${id}`);
    return await response.json();
};
