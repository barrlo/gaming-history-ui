'use client';
import useSWR from 'swr';
import {getWowCharacters} from '@/services/wow-service';
import {Skeleton} from '@mui/material';
import {DataGrid, GridColDef} from '@mui/x-data-grid';

export const Content = ({name}: {name: string}) => {
    const {data, error, isLoading} = useSWR('/wow/characters', getWowCharacters);
    const characters = data || [];
    const character = characters.find(char => char.name.toLowerCase() === name) || {
        name: '',
        mythicPlusScoresBySeason: []
    };

    const columns: GridColDef[] = [
        {field: 'name', headerName: 'Season', flex: 2, minWidth: 200},
        {
            field: 'score',
            headerName: 'M+ Score',
            flex: 1,
            minWidth: 150
        }
    ];

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

    return (
        <>
            <h1>{`${character.name.toUpperCase()}`}</h1>
            <DataGrid
                columns={columns}
                rows={character.mythicPlusScoresBySeason}
                hideFooter
                pageSizeOptions={[25]}
                rowSelection={false}
            />
        </>
    );
};
