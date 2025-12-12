/**
 * Nyuchi Platform - React Native Paper Provider
 * Provides Paper theme with light/dark mode support
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PaperProvider as RNPaperProvider } from 'react-native-paper';
import { nyuchiLightTheme, nyuchiDarkTheme } from '@/theme/nyuchi-theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  isDark: false,
  setMode: () => {},
  toggleMode: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export function PaperProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('nyuchi-theme-mode') as ThemeMode;
    if (stored) {
      setModeState(stored);
    }
  }, []);

  // Resolve system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolvedMode = () => {
      if (mode === 'system') {
        setIsDark(mediaQuery.matches);
      } else {
        setIsDark(mode === 'dark');
      }
    };

    updateResolvedMode();
    mediaQuery.addEventListener('change', updateResolvedMode);

    return () => mediaQuery.removeEventListener('change', updateResolvedMode);
  }, [mode]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('nyuchi-theme-mode', newMode);
  };

  const toggleMode = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  const theme = isDark ? nyuchiDarkTheme : nyuchiLightTheme;

  return (
    <ThemeContext.Provider value={{ mode, isDark, setMode, toggleMode }}>
      <RNPaperProvider theme={theme}>
        {children}
      </RNPaperProvider>
    </ThemeContext.Provider>
  );
}
