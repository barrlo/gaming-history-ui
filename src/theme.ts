'use client';
import {Roboto} from 'next/font/google';
import {createTheme} from '@mui/material/styles';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap'
});

// export const lightTheme = createTheme({
//     typography: {
//         fontFamily: roboto.style.fontFamily
//     }
// });

export const darkTheme = createTheme({
    palette: {
        mode: 'dark'
    },
    typography: {
        fontFamily: roboto.style.fontFamily
    }
});
