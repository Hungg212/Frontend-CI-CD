import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeStore {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const applyTheme = (_theme: ResolvedTheme): void => {
  // Force light mode always to avoid dark-on-light contrast issues
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light' as ThemeMode,
      resolvedTheme: 'light' as ResolvedTheme,
      setTheme: (theme: ThemeMode) => {
        applyTheme('light');
        set({ theme: 'light' as ThemeMode, resolvedTheme: 'light' as ResolvedTheme });
      },
      toggleTheme: () => {
        applyTheme('light');
        set({ theme: 'light' as ThemeMode, resolvedTheme: 'light' as ResolvedTheme });
      },
    }),
    {
      name: 'coffee-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.resolvedTheme);
        }
      },
    }
  )
);
