'use client';
import useSWR from 'swr';
import {Skeleton} from '@mui/material';
import {getWowCharacters} from '@/services/wow-service';

export default function WoW() {
    const {data, error, isLoading} = useSWR('/wow/characters', getWowCharacters);

    if (error) {
        return <p>{'Failed to load.'}</p>;
    }

    if (isLoading) {
        return (
            <>
                <Skeleton sx={{fontSize: '2rem'}} />
                <Skeleton variant={'rounded'} sx={{height: '300px', width: '100%'}} />
            </>
        );
    }

    return <h1>{'World of Warcraft History'}</h1>;
}
