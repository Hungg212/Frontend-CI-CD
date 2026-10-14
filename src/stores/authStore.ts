import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });
          const user = response.user as User;
          set({
            user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          });
          return { success: true, user };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Đăng nhập thất bại';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          const user = response.user as User;
          set({
            user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false
          });
          return { success: true };
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Đăng ký thất bại';
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const user = await authApi.me(token) as User;
          set({ user, isAuthenticated: true });
        } catch {
          // Token expired or invalid
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'coffee-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
