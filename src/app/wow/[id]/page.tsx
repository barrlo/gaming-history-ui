import {Content} from '@/app/wow/[id]/content';
import {getWowCharacters} from '@/services/wow-service';

export default function Character({params: {id}}: {params: {id: number}}) {
    return <Content id={id} />;
}

export const generateStaticParams = async () => {
    return (await getWowCharacters()).map(character => ({...character, id: character.id.toString()}));
};
