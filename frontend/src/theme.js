import { createTheme } from '@mui/material/styles';

const paletteDefault = {               // Scholarly Vibes
    primary: '#4B3D2D',
    accent: '#C2B280',
    brown: '#8B5B29',
    beige: '#E3D4B9',
    light: '#D9CBA0'
};

// const palette = {               // Modern Elegance
//     primary: '#3A2C2F',
//     accent: '#BFA6A0',
//     brown: '#7D5A4E',
//     beige: '#E8D8C3',
//     light: '#D1C6B9'
// };

// const palette = {                // Coastal Calm
//     primary: '#2E4053',
//     accent: '#AED6F1',
//     brown: '#5D6D7E',
//     beige: '#F4F6F7',
//     light: '#D5DBDB'
// };

// const palette = {                // Rustic Charm
//     primary: '#4A3C2A',
//     accent: '#D5BDAF',
//     brown: '#8E735B',
//     beige: '#E8DCC9',
//     light: '#F0EDE5'
// };

// const palette = {                // Blue Serenity
//     primary: '#2C3E50',
//     accent: '#5DADE2',
//     brown: '#1F618D',
//     beige: '#EBF5FB',
//     light: '#D6DBDF'
// };

// const palette = {                // Red Passion
//     primary: '#C0392B',
//     accent: '#E74C3C',
//     brown: '#A93226',
//     beige: '#FADBD8',
//     light: '#F5B7B1'
// };

// const palette = {         // Black and White
//     primary: '#000000',
//     accent: '#FFFFFF',
//     brown: '#808080',
//     beige: '#F0F0F0',
//     light: '#D3D3D3'
// };

// const palette = {                // Dark Mode
//     primary: '#121212',         // Dark Gray
//     accent: '#BB86FC',          // Purple
//     brown: '#03DAC6',           // Teal
//     beige: '#1F1F1F',           // Almost Black
//     light: '#303030'            // Medium Gray
// };

export const buildTheme = (palette) => createTheme({
    palette: {
        primary: {
            main: palette.primary,    // Primary
            contrastText: '#fff',
        },
        secondary: {
            main: palette.brown,    // Brown
            contrastText: '#fff',
        },
        background: {
            default: palette.beige, // Beige
            paper: palette.light,   // Light
        },
        text: {
            primary: palette.primary, // Primary
            secondary: palette.brown,   // Brown
        },
        info: {
            main: palette.accent,    // Accent
            contrastText: palette.primary, // Primary
        }
    },
    offWhite: '#F8F6F1',
    shape: {
        borderRadius: 12
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: palette.primary,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 700,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: palette.accent,
                    color: palette.primary,
                    transition: 'transform .2s',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    background: palette.light,
                },
            },
        },
    },
});
export const THEMES = {
    scholarly: paletteDefault,
    modernElegance: { primary: '#3A2C2F', accent: '#BFA6A0', brown: '#7D5A4E', beige: '#E8D8C3', light: '#D1C6B9' },
    coastalCalm: { primary: '#2E4053', accent: '#AED6F1', brown: '#5D6D7E', beige: '#F4F6F7', light: '#D5DBDB' },
    rusticCharm: { primary: '#4A3C2A', accent: '#D5BDAF', brown: '#8E735B', beige: '#E8DCC9', light: '#F0EDE5' },
    blueSerenity: { primary: '#2C3E50', accent: '#5DADE2', brown: '#1F618D', beige: '#EBF5FB', light: '#D6DBDF' },
    redPassion: { primary: '#C0392B', accent: '#E74C3C', brown: '#A93226', beige: '#FADBD8', light: '#F5B7B1' },
    blackWhite: { primary: '#000000', accent: '#FFFFFF', brown: '#808080', beige: '#F0F0F0', light: '#D3D3D3' },
    darkMode: { primary: '#121212', accent: '#BB86FC', brown: '#03DAC6', beige: '#1F1F1F', light: '#303030' },
};

export const THEME_LABELS = {
    scholarly: 'Scholarly Vibes',
    modernElegance: 'Modern Elegance',
    coastalCalm: 'Coastal Calm',
    rusticCharm: 'Rustic Charm',
    blueSerenity: 'Blue Serenity',
    redPassion: 'Red Passion',
    blackWhite: 'Black & White',
    darkMode: 'Dark Mode',
};

export default buildTheme(paletteDefault);
