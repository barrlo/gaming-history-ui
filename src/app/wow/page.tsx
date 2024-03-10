'use client';
import useSWR from 'swr';
import {Skeleton} from '@mui/material';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {getWowCharacters} from '@/services/wow-service';

export default function WoW() {
    const {data, error, isLoading} = useSWR('/wow/characters', getWowCharacters);
    const characters = data || [];
    const columns: GridColDef[] = [
        {field: 'name', headerName: 'Name', flex: 2, minWidth: 200},
        {field: 'mythicPlusScore', headerName: 'Current M+ Score', flex: 1, minWidth: 150},
        {field: 'itemLevel', headerName: 'Current Item Level', flex: 1, minWidth: 150}
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
            <h1>{'World of Warcraft History'}</h1>
            <DataGrid columns={columns} rows={characters} />
        </>
    );
}
