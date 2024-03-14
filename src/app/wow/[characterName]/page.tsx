import {Content} from '@/app/wow/[characterName]/content';

export default function Character({params: {characterName}}: {params: {characterName: string}}) {
    return <Content name={characterName} />;
}

export const generateStaticParams = () => {
    return [{characterName: 'barrlidan'}, {characterName: 'barrlo'}];
};
