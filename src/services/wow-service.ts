type Character = {
    name: string;
    mythicPlusScore: number;
    itemLevel: number;
};

export const getWowCharacters = async (): Promise<Character> => {
    // const res = await fetch('https://api.github.com/repos/vercel/next.js');
    // return await res.json();
    return Promise.resolve({
        name: 'Barrlidan',
        mythicPlusScore: 3223.6477,
        itemLevel: 485
    });
};
