import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#0ea5e9',
            light: '#e0f2fe',
            dark: '#0369a1',
        },
        secondary: {
            main: '#64748b',
            light: '#f1f5f9',
            dark: '#334155',
        },
        background: {
            default: '#f8fafc',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                },
            },
        },
    },
});

export default theme;
