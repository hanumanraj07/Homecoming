import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { radii, shadows, spacing, theme, typography } from '../constants/theme';

const STORAGE_KEY = 'homecoming.themeMode';
const MODES = ['light', 'dark', 'system'];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme() ?? 'light';
  const [mode, setMode] = useState('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (isMounted && MODES.includes(stored)) {
          setMode(stored);
        }
      })
      .finally(() => {
        if (isMounted) setIsReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setThemeMode = (nextMode) => {
    if (!MODES.includes(nextMode)) return;
    setMode(nextMode);
    AsyncStorage.setItem(STORAGE_KEY, nextMode).catch(() => {});
  };

  const toggleTheme = () => {
    const resolved = mode === 'system' ? systemScheme : mode;
    setThemeMode(resolved === 'dark' ? 'light' : 'dark');
  };

  const scheme = mode === 'system' ? systemScheme : mode;

  const value = useMemo(
    () => ({
      mode,
      scheme,
      isReady,
      colors: theme[scheme],
      spacing,
      radii,
      typography,
      shadows,
      setThemeMode,
      toggleTheme,
    }),
    [mode, scheme, isReady]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
