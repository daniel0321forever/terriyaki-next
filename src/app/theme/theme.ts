import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#F7E4C5', // teal-500
      dark: '#0f766e', // teal-700
    },
    secondary: {
      main: '#FF9D00', // yellow-400
      dark: '#f59e0b', // yellow-500
    },
    success: {
      main: '#84cc16', // lime-500
      light: '#a3e635', // lime-400
    },
    warning: {
      main: '#f97316', // orange-500
      light: '#fb923c', // orange-400
    },
    grey: {
      100: '#f3f4f6',
      300: '#d1d5db',
      800: '#1f2937',
      900: '#111827',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '4rem',
      lineHeight: 1.1,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 16,
          padding: '12px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
}); 