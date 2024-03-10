export default function Character({params: {character}}: {params: {character: string}}) {
    return <h1>{`${character.toUpperCase()}`}</h1>;
}

export const generateStaticParams = () => {
    return [{character: 'barrlidan'}, {character: 'barrlo'}];
};
