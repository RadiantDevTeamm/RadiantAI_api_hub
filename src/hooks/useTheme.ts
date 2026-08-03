import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_THEME, type ThemeId } from '@/types/theme';

const STORAGE_KEY = 'radiant.theme';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME;
    return (localStorage.getItem(STORAGE_KEY) as ThemeId) || DEFAULT_THEME;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = useCallback((t: ThemeId) => setTheme(t), []);

  return { theme, setTheme: toggleTheme };
}
