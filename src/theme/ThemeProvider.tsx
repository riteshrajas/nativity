import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'nativity.theme-preference';

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'system';
  }

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    return stored ?? 'system';
  } catch {
    return 'system';
  }
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined') {
      return 'light';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always use dark theme
  const theme: Theme = 'dark';
  const setTheme = () => {}; // No-op function since theme is locked

  useEffect(() => {
    // Always set dark mode
    const root = document.documentElement;
    root.classList.add('dark');
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme, resolvedTheme: 'dark' }), []);

  // Create a MUI theme that is always dark mode
  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: 'dark',
        primary: {
          // cyan-ish primary to match existing brand
          main: '#06b6d4',
        },
        secondary: {
          main: '#7c3aed',
        },
        background: {
          default: '#0f1724',
          paper: '#111827',
        },
      },
      typography: {
        fontFamily: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ].join(','),
      },
      shape: {
        borderRadius: 12,
      },
    });
  }, []);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </MuiThemeProvider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
