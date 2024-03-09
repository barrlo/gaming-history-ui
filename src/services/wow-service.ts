import {WoWCharacter} from '@/types/wow-character';

export const getWowCharacters = async (): Promise<WoWCharacter[]> => {
    // const res = await fetch('https://api.github.com/repos/vercel/next.js');
    // return await res.json();
    return Promise.resolve([
        {
            id: 194665345,
            name: 'Barrlidan',
            mythicPlusScore: 3223.6477,
            itemLevel: 485
        }
    ]);
};
