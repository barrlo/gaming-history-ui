'use client';
import useSWR from 'swr';
import {Skeleton} from '@mui/material';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {LineChart} from '@mui/x-charts';
import {getWowCharacterDetails} from '@/services/wow-service';
import {unix} from 'dayjs';

export const Content = ({id}: {id: number}) => {
    const {data, error, isLoading} = useSWR(`${id}`, getWowCharacterDetails);
    const character = data || {
        name: '',
        mythicPlusScoresBySeason: [],
        mythicPlusScoresCurrentSeason: []
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

    const dateFormatter = (date: number) => {
        return unix(date).format('MM/DD/YYYY');
    };

    if (error) {
        return <p>{'Failed to load.'}</p>;
    }

    if (isLoading) {
        return (
            <>
                <Skeleton sx={{fontSize: '2rem'}} />
                <Skeleton variant={'rounded'} sx={{height: '300px', width: '100%'}} />
                <Skeleton variant={'rounded'} sx={{height: '300px', width: '100%'}} />
            </>
        );
    }

    return (
        <>
            <h1>{`${character.name.toUpperCase()}`}</h1>
            <LineChart
                dataset={character.mythicPlusScoresCurrentSeason}
                series={[{dataKey: 'score'}]}
                xAxis={[{dataKey: 'date', valueFormatter: dateFormatter}]}
                height={300}
                axisHighlight={{x: 'none', y: 'none'}}
            />
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
