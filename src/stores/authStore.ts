import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEMO_USERS } from '../data/users';
import { generateId } from '../utils/formatters';
import type { RegisterData, Address } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  createdAt: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
  addAddress: (address: Address) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const simulateDelay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        await simulateDelay();
        const demoUser = DEMO_USERS[email.toLowerCase()];
        if (!demoUser) {
          set({ isLoading: false, error: 'Email không tồn tại' });
          return { success: false, message: 'Email không tồn tại' };
        }
        if (demoUser.password !== password) {
          set({ isLoading: false, error: 'Mật khẩu không chính xác' });
          return { success: false, message: 'Mật khẩu không chính xác' };
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...rest } = demoUser;
        const user: User = {
          ...rest,
          addresses: rest.addresses ?? [],
          createdAt: rest.createdAt ?? new Date().toISOString(),
        } as User;
        set({ user, isAuthenticated: true, isLoading: false });
        return { success: true, user };
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        await simulateDelay();
        if (DEMO_USERS[data.email.toLowerCase()]) {
          set({ isLoading: false, error: 'Email đã được sử dụng' });
          return { success: false, message: 'Email đã được sử dụng' };
        }
        const newUser: User = {
          id: generateId('user'),
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatar: `https://i.pravatar.cc/300?u=${encodeURIComponent(data.email)}`,
          role: 'customer',
          addresses: [],
          createdAt: new Date().toISOString(),
        };
        DEMO_USERS[data.email.toLowerCase()] = {
          ...newUser,
          password: data.password,
        };
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return { success: true, user: newUser };
      },

      logout: () => set({ user: null, isAuthenticated: false, error: null }),
      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      clearError: () => set({ error: null }),

      addAddress: (address) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, addresses: [...(state.user.addresses ?? []), address] }
            : null,
        })),

      updateAddress: (id, address) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                addresses: state.user.addresses.map((a) =>
                  a.id === id ? { ...a, ...address } : a,
                ),
              }
            : null,
        })),

      removeAddress: (id) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, addresses: state.user.addresses.filter((a) => a.id !== id) }
            : null,
        })),

      setDefaultAddress: (id) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                addresses: state.user.addresses.map((a) => ({
                  ...a,
                  isDefault: a.id === id,
                })),
              }
            : null,
        })),
    }),
    {
      name: 'coffee-auth',
    },
  ),
);
