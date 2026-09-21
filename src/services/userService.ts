import type { User, RegisterData, UpdateProfileData } from '../types';
import { DEMO_USERS } from '../data/users';
import { generateId } from '../utils/formatters';

const simulateDelay = (ms: number = 400) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const userService = {
  async login(email: string, password: string): Promise<User> {
    await simulateDelay(500);

    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (!demoUser) {
      throw new Error('Email không tồn tại trong hệ thống');
    }
    if (demoUser.password !== password) {
      throw new Error('Mật khẩu không chính xác');
    }

    const { password: _, ...userWithoutPassword } = demoUser;
    return userWithoutPassword;
  },

  async register(data: RegisterData): Promise<User> {
    await simulateDelay(600);

    if (DEMO_USERS[data.email.toLowerCase()]) {
      throw new Error('Email đã được sử dụng');
    }

    return {
      id: generateId('user'),
      email: data.email,
      name: data.name,
      phone: data.phone,
      addresses: [],
      avatar: `https://i.pravatar.cc/300?u=${encodeURIComponent(data.email)}`,
      createdAt: new Date().toISOString(),
    };
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    await simulateDelay(400);

    return {
      id: 'user-current',
      email: 'user@example.com',
      name: data.name || 'User',
      phone: data.phone,
      addresses: data.addresses || [],
      avatar: data.avatar,
      createdAt: new Date().toISOString(),
    };
  },

  async getCurrentUser(): Promise<User | null> {
    await simulateDelay(100);
    return null;
  },
};
