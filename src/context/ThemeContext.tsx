import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ThemeModePreference } from '../../shared/types/userSettings';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  /** Resolved active visual mode ('light' or 'dark'). */
  theme: ThemeMode;
  /** User preference ('light' | 'dark' | 'system'). */
  themePreference: ThemeModePreference;
  isDark: boolean;
  setTheme: (mode: ThemeModePreference) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'cdes_study_theme';

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  themePreference: 'light',
  isDark: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

function readSystemDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function readInitialThemePreference(): ThemeModePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
  } catch {
    // Ignore storage access restrictions
  }
  return 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState<ThemeModePreference>(readInitialThemePreference);
  const [systemDark, setSystemDark] = useState<boolean>(readSystemDark);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent): void => {
      setSystemDark(event.matches);
    };
    setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme: ThemeMode =
    themePreference === 'system' ? (systemDark ? 'dark' : 'light') : themePreference;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.dataset.theme = resolvedTheme;
    try {
      localStorage.setItem(STORAGE_KEY, themePreference);
    } catch {
      // Ignore storage access restrictions
    }
  }, [resolvedTheme, themePreference]);

  const setTheme = useCallback((mode: ThemeModePreference): void => {
    setThemePreferenceState(mode);
  }, []);

  const toggleTheme = useCallback((): void => {
    setThemePreferenceState((prev) => {
      const currentResolved = prev === 'system' ? (readSystemDark() ? 'dark' : 'light') : prev;
      return currentResolved === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: resolvedTheme,
      themePreference,
      isDark: resolvedTheme === 'dark',
      setTheme,
      toggleTheme,
    }),
    [resolvedTheme, themePreference, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
