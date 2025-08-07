import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#4B3D2D',    // Primary
            contrastText: '#fff',
        },
        secondary: {
            main: '#8B5B29',    // Brown
            contrastText: '#fff',
        },
        background: {
            default: '#E3D4B9', // Beige
            paper: '#D9CBA0',   // Light
        },
        text: {
            primary: '#4B3D2D', // Primary
            secondary: '#8B5B29',   // Brown
        },
        info: {
            main: '#C2B280',    // Accent
            contrastText: '#4B3D2D', // Primary
        }
    },
    offWhite: '#F8F6F1',
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
