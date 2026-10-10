import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const applyTheme = (_theme: 'light' | 'dark') => {
  // Force light mode always to avoid dark-on-light contrast issues
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme: 'light', resolvedTheme: 'light' });
      },
      toggleTheme: () => {
        applyTheme('light');
        set({ theme: 'light', resolvedTheme: 'light' });
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
