import { useEffect, type ReactNode } from 'react';
import { useThemeStore } from '@/stores/themeStore';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const setTheme = useThemeStore((s) => s.setTheme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);

  useEffect(() => {
    // Apply theme on mount
    const { resolvedTheme: r } = useThemeStore.getState();
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', r === 'dark');
    }
  }, []);

  const value = {
    theme: useThemeStore.getState().theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

import { createContext, useContext } from 'react';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
