import { createTheme, type CSSVariablesResolver } from '@mantine/core';

export const theme = createTheme({
  fontFamily: 'Inter, Arial, sans-serif',
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  dark: {
    '--mantine-color-body': '#10151e',
    '--mantine-color-text': '#edf2fa',
    '--site-accent': '#88baff',
    '--site-action': '#1e2938',
    '--site-available': '#82d9bb',
    '--site-background': 'var(--mantine-color-body)',
    '--site-description': '#bbc5d3',
    '--site-muted': '#a8b6c9',
    '--site-primary-action': '#243247',
    '--site-primary-text': '#bcd8ff',
    '--site-surface': '#18212d',
    '--site-text': 'var(--mantine-color-text)',
  },
  light: {
    '--mantine-color-body': '#f5f7fb',
    '--mantine-color-text': '#172437',
    '--site-accent': '#245ca6',
    '--site-action': '#edf1f7',
    '--site-available': '#237458',
    '--site-background': 'var(--mantine-color-body)',
    '--site-description': '#4c5b70',
    '--site-muted': '#566479',
    '--site-primary-action': '#e7effb',
    '--site-primary-text': '#245ca6',
    '--site-surface': '#ffffff',
    '--site-text': 'var(--mantine-color-text)',
  },
  variables: {},
});
