import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#3b82f6', // Bright modern blue
    },
    secondary: {
      main: '#10b981', // Emerald green
    },
    background: {
      default: '#0f172a', // Deep slate
      paper: 'rgba(30, 41, 59, 0.7)', // Semi-transparent for glass effect
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  overrides: {
    MuiPaper: {
      root: {
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
    },
    MuiButton: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
      },
      containedPrimary: {
        background: 'linear-gradient(45deg, #3b82f6 30%, #2563eb 90%)',
        boxShadow: '0 3px 5px 2px rgba(59, 130, 246, .3)',
      },
    },
    MuiCard: {
      root: {
        borderRadius: 16,
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
    },
  },
});

export default theme;
