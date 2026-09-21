import type { User } from '../types';

export interface DemoUser extends User {
  password: string;
}

export const users: User[] = [
  {
    id: 'user-1',
    email: 'admin@coffee.com',
    name: 'Nguyễn Văn Admin',
    avatar: 'https://i.pravatar.cc/300?img=12',
    phone: '0901234567',
    addresses: [
      {
        id: 'addr-1',
        label: 'office',
        name: 'Nguyễn Văn Admin',
        phone: '0901234567',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        detail: '123 Nguyễn Huệ',
        isDefault: true,
      },
    ],
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'user-2',
    email: 'customer@coffee.com',
    name: 'Trần Thị Khách Hàng',
    avatar: 'https://i.pravatar.cc/300?img=25',
    phone: '0912345678',
    addresses: [
      {
        id: 'addr-2',
        label: 'home',
        name: 'Trần Thị Khách Hàng',
        phone: '0912345678',
        province: 'Hà Nội',
        district: 'Quận Cầu Giấy',
        ward: 'Phường Dịch Vọng',
        detail: '456 Xuân Thủy',
        isDefault: true,
      },
      {
        id: 'addr-3',
        label: 'office',
        name: 'Trần Thị Khách Hàng',
        phone: '0912345678',
        province: 'Hà Nội',
        district: 'Quận Hoàn Kiếm',
        ward: 'Phường Hàng Bài',
        detail: '78 Tràng Tiền',
        isDefault: false,
      },
    ],
    createdAt: '2025-03-20T10:00:00Z',
  },
  {
    id: 'user-3',
    email: 'vip@coffee.com',
    name: 'Lê Hoàng VIP',
    avatar: 'https://i.pravatar.cc/300?img=33',
    phone: '0923456789',
    addresses: [
      {
        id: 'addr-4',
        label: 'home',
        name: 'Lê Hoàng VIP',
        phone: '0923456789',
        province: 'TP. Hồ Chí Minh',
        district: 'Quận 2',
        ward: 'Phường Thảo Điền',
        detail: '789 Nguyễn Văn Hưởng',
        isDefault: true,
      },
    ],
    createdAt: '2025-02-10T10:00:00Z',
  },
];

export const DEMO_USERS: Record<string, DemoUser> = {
  'admin@coffee.com': {
    ...users[0],
    password: 'admin123',
  },
  'customer@coffee.com': {
    ...users[1],
    password: 'user123',
  },
  'vip@coffee.com': {
    ...users[2],
    password: 'vip123',
  },
};

export const getUserByEmail = (email: string): User | undefined =>
  users.find((u) => u.email === email);
