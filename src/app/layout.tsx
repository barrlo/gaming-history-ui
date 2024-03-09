import React from 'react';
import type {Metadata} from 'next';
import {AppRouterCacheProvider} from '@mui/material-nextjs/v13-appRouter';
import {ThemeProvider} from '@mui/material/styles';
import {AppBar, Button, Container, CssBaseline, Toolbar} from '@mui/material';
import {darkTheme} from '@/theme';

export const metadata: Metadata = {
    title: 'Barrlo Gaming History'
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    const routes = [
        {href: '/', label: 'Home'},
        {href: '/wow', label: 'WoW'},
        {href: '/poe', label: 'PoE'}
    ];

    return (
        <html lang='en'>
            <body>
                <AppRouterCacheProvider>
                    <ThemeProvider theme={darkTheme}>
                        <CssBaseline />
                        <Container disableGutters fixed sx={{height: '100%'}}>
                            <AppBar position={'sticky'}>
                                <Toolbar>
                                    {routes.map(route => (
                                        <Button key={route.label} href={route.href}>
                                            {route.label}
                                        </Button>
                                    ))}
                                </Toolbar>
                            </AppBar>
                            <Container>{children}</Container>
                        </Container>
                    </ThemeProvider>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
