'use client';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { theme } from '../theme/theme';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// Create emotion cache for client-side
const createEmotionCache = () => {
  return createCache({ key: 'css', prepend: true });
};

const clientSideEmotionCache = createEmotionCache();

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
} 