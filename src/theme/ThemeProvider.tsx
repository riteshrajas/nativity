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
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme());

  useEffect(() => {
    const resolved = resolveTheme(theme);
    const root = document.documentElement;

    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore write failures
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') {
      return undefined;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => setTheme('system');
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme, resolvedTheme: resolveTheme(theme) }), [theme]);

  // Create a MUI theme that mirrors the app's branding and respects the resolved theme
  const muiTheme = useMemo(() => {
    const mode = resolveTheme(theme);
    return createTheme({
      palette: {
        mode,
        primary: {
          // cyan-ish primary to match existing brand
          main: '#06b6d4',
        },
        secondary: {
          main: '#7c3aed',
        },
        background: {
          default: mode === 'dark' ? '#0f1724' : '#f8fafc',
          paper: mode === 'dark' ? '#111827' : '#ffffff',
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
  }, [theme]);

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
