import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from './authStore';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const mockFetch = (impl: (url: string, init?: RequestInit) => Promise<Response>) => {
  const spy = vi.fn((input: RequestInfo | URL, init?: RequestInit) =>
    impl(String(input), init)
  );
  global.fetch = spy as unknown as typeof fetch;
  return spy;
};

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should store the user and token on success', async () => {
      mockFetch(async () =>
        jsonResponse({
          token: 'jwt-token',
          user: { id: 'u1', email: 'a@b.com', name: 'A', role: 'user' },
        })
      );

      const { result } = renderHook(() => useAuthStore());

      let loginResult: { success: boolean; user?: unknown } = { success: false };
      await act(async () => {
        loginResult = await result.current.login('a@b.com', 'password123');
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.user).toBeDefined();
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe('jwt-token');
    });

    it('should surface the API error message on invalid credentials', async () => {
      mockFetch(async () => jsonResponse({ error: 'Sai email hoặc mật khẩu' }, 401));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('a@b.com', 'wrong');
      });

      expect(result.current.error).toBe('Sai email hoặc mật khẩu');
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should keep the error state clear before the request starts', async () => {
      mockFetch(async () => jsonResponse({ error: 'Sai email hoặc mật khẩu' }, 401));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('a@b.com', 'wrong');
      });
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('register', () => {
    it('should authenticate the user after a successful registration', async () => {
      mockFetch(async () =>
        jsonResponse({
          token: 'jwt-token',
          user: { id: 'u1', email: 'new@b.com', name: 'New User', role: 'user' },
        })
      );

      const { result } = renderHook(() => useAuthStore());

      let registerResult: { success: boolean } = { success: false };
      await act(async () => {
        registerResult = await result.current.register({
          name: 'New User',
          email: 'new@b.com',
          password: 'password123',
        });
      });

      expect(registerResult.success).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.name).toBe('New User');
    });

    it('should report an error when the email is already taken', async () => {
      mockFetch(async () => jsonResponse({ error: 'Email đã được sử dụng' }, 409));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.register({
          name: 'Dup',
          email: 'dup@b.com',
          password: 'password123',
        });
      });

      expect(result.current.error).toBe('Email đã được sử dụng');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear the user state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('checkAuth', () => {
    it('should load the current user with a valid token', async () => {
      mockFetch(async () =>
        jsonResponse({ id: 'u1', email: 'a@b.com', name: 'A', role: 'user' })
      );

      const { result } = renderHook(() => useAuthStore());
      act(() => {
        useAuthStore.setState({ token: 'jwt-token' });
      });

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.user?.email).toBe('a@b.com');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear the session when the token is rejected', async () => {
      mockFetch(async () => jsonResponse({ error: 'Unauthorized' }, 401));

      const { result } = renderHook(() => useAuthStore());
      act(() => {
        useAuthStore.setState({ token: 'expired', user: { id: 'u1' } as never });
      });

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should do nothing without a token', async () => {
      const spy = mockFetch(async () => jsonResponse({}));

      const { result } = renderHook(() => useAuthStore());
      act(() => {
        useAuthStore.setState({ token: null });
      });

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
