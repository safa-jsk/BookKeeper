import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#4B3D2D',
            contrastText: '#fff',
        },
        secondary: {
            main: '#8B5B29',
            contrastText: '#fff',
        },
        background: {
            default: '#E3D4B9',
            paper: '#D9CBA0',
        },
        text: {
            primary: '#4B3D2D',
            secondary: '#8B5B29',
        },
        info: {
            main: '#C2B280',
            contrastText: '#4B3D2D',
        }
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#4B3D2D',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: '#C2B280',
                    color: '#4B3D2D',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    background: '#D9CBA0',
                },
            },
        },
    },
});

export default theme;
