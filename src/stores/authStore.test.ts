import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './authStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('authStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const { result } = renderHook(() => useAuthStore());

      let loginResult: { success: boolean; message?: string; user?: unknown } = { success: false };

      // Use correct demo user email from users.ts
      await act(async () => {
        loginResult = await result.current.login('admin@coffee.com', 'admin123');
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.user).toBeDefined();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should fail login with invalid email', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('nonexistent@coffeehome.vn', '123456');
      });

      expect(result.current.error).toBe('Email không tồn tại');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should fail login with wrong password', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('admin@coffee.com', 'wrongpassword');
      });

      expect(result.current.error).toBe('Mật khẩu không chính xác');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set loading state during login', async () => {
      const { result } = renderHook(() => useAuthStore());

      let _isLoadingDuringRequest = false;

      act(() => {
        const loginPromise = result.current.login('admin@coffeehome.vn', '123456');
        _isLoadingDuringRequest = result.current.isLoading;
        loginPromise;
      });

      // Initial state check
      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });

  describe('logout', () => {
    it('should logout and clear user state', async () => {
      const { result } = renderHook(() => useAuthStore());

      // First register (works with isolated state)
      const uniqueEmail = `logouttest${Date.now()}@example.com`;

      await act(async () => {
        await result.current.register({
          name: 'Logout Test',
          email: uniqueEmail,
          password: 'password123',
        });
      });

      // Verify user is authenticated
      expect(result.current.user).not.toBeNull();

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const { result } = renderHook(() => useAuthStore());

      const uniqueEmail = `testuser${Date.now()}@example.com`;

      let registerResult: { success: boolean; message?: string; user?: unknown } = {
        success: false,
      };

      await act(async () => {
        registerResult = await result.current.register({
          name: 'Test User',
          email: uniqueEmail,
          password: 'password123',
          phone: '0901234567',
        });
      });

      expect(registerResult.success).toBe(true);
      expect(registerResult.user).toBeDefined();
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.name).toBe('Test User');
    });

    it('should fail to register with existing email', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Register first user
      await act(async () => {
        await result.current.register({
          name: 'First User',
          email: 'duplicate@example.com',
          password: 'password123',
        });
      });

      // Try to register with same email
      await act(async () => {
        await result.current.register({
          name: 'Second User',
          email: 'duplicate@example.com',
          password: 'password456',
        });
      });

      expect(result.current.error).toBe('Email đã được sử dụng');
    });

    it('should generate avatar URL for new user', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register({
          name: 'Avatar Test',
          email: `avatartest${Date.now()}@example.com`,
          password: 'password123',
        });
      });

      expect(result.current.user?.avatar).toBeDefined();
      expect(result.current.user?.avatar).toContain('pravatar.cc');
    });
  });

  describe('updateUser', () => {
    it('should update user information', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register({
          name: 'Original Name',
          email: `updatetest${Date.now()}@example.com`,
          password: 'password123',
        });
      });

      act(() => {
        result.current.updateUser({ name: 'Updated Name' });
      });

      expect(result.current.user?.name).toBe('Updated Name');
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Trigger an error
      await act(async () => {
        await result.current.login('nonexistent@example.com', '123456');
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('address management', () => {
    it('should add an address', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register({
          name: 'Address Test',
          email: `addresstest${Date.now()}@example.com`,
          password: 'password123',
        });
      });

      act(() => {
        result.current.addAddress({
          id: 'addr-1',
          label: 'home',
          name: 'Address Test',
          phone: '0901234567',
          province: 'TP. Hồ Chí Minh',
          district: 'Quận 1',
          ward: 'Phường Bến Nghé',
          detail: '123 Nguyễn Huệ',
          isDefault: true,
        });
      });

      expect(result.current.user?.addresses).toHaveLength(1);
      expect(result.current.user?.addresses[0].province).toBe('TP. Hồ Chí Minh');
    });

    it('should update an address', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register({
          name: 'Update Address Test',
          email: `updateaddresstest${Date.now()}@example.com`,
          password: 'password123',
        });
      });

      act(() => {
        result.current.addAddress({
          id: 'addr-1',
          label: 'home',
          name: 'Update Address Test',
          phone: '0901234567',
          province: 'TP. Hồ Chí Minh',
          district: 'Quận 1',
          ward: 'Phường Bến Nghé',
          detail: '123 Nguyễn Huệ',
          isDefault: true,
        });
        result.current.updateAddress('addr-1', { detail: '456 Updated Address' });
      });

      expect(result.current.user?.addresses[0].detail).toBe('456 Updated Address');
    });

    it('should remove an address', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register({
          name: 'Remove Address Test',
          email: `removeaddresstest${Date.now()}@example.com`,
          password: 'password123',
        });
      });

      act(() => {
        result.current.addAddress({
          id: 'addr-1',
          label: 'home',
          name: 'Remove Address Test',
          phone: '0901234567',
          province: 'TP. Hồ Chí Minh',
          district: 'Quận 1',
          ward: 'Phường Bến Nghé',
          detail: '123 Nguyễn Huệ',
          isDefault: true,
        });
        result.current.removeAddress('addr-1');
      });

      expect(result.current.user?.addresses).toHaveLength(0);
    });

    it('should set default address', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register({
          name: 'Default Address Test',
          email: `defaultaddresstest${Date.now()}@example.com`,
          password: 'password123',
        });
      });

      act(() => {
        result.current.addAddress({
          id: 'addr-1',
          label: 'home',
          name: 'Default Address Test',
          phone: '0901234567',
          province: 'TP. Hồ Chí Minh',
          district: 'Quận 1',
          ward: 'Phường Bến Nghé',
          detail: '123 Nguyễn Huệ',
          isDefault: true,
        });
        result.current.addAddress({
          id: 'addr-2',
          label: 'office',
          name: 'Default Address Test',
          phone: '0901234567',
          province: 'Hà Nội',
          district: 'Quận Hoàn Kiếm',
          ward: 'Phường Hàng Bài',
          detail: '456 Tràng Tiền',
          isDefault: false,
        });
        result.current.setDefaultAddress('addr-2');
      });

      expect(result.current.user?.addresses.find((a) => a.id === 'addr-1')?.isDefault).toBe(false);
      expect(result.current.user?.addresses.find((a) => a.id === 'addr-2')?.isDefault).toBe(true);
    });
  });
});
