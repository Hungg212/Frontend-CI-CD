import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, Coffee, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});
type LoginData = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { label: 'Demo Admin', email: 'admin@coffeehome.vn', password: '123456' },
  { label: 'Demo User', email: 'user@coffeehome.vn', password: '123456' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const pushNotification = useUIStore((s) => s.pushNotification);
  const [showHint, setShowHint] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginData) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      pushNotification({ type: 'success', title: 'Đăng nhập thành công', message: 'Chào mừng bạn quay lại!' });
      navigate('/profile');
    } else {
      pushNotification({ type: 'error', title: 'Đăng nhập thất bại', message: result.message ?? 'Lỗi đăng nhập' });
    }
  };

  const fillDemo = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-700 text-white mb-3">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Chào Mừng Trở Lại</h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">Đăng nhập để tiếp tục mua sắm</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              {...register('email')}
              error={errors.email?.message}
              autoComplete="email"
            />
            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
              leftIcon={<Lock className="w-4 h-4" />}
              {...register('password')}
              error={errors.password?.message}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
                <span className="text-stone-700 dark:text-stone-300">Ghi nhớ đăng nhập</span>
              </label>
              <Link to="/auth/forgot-password" className="text-amber-700 dark:text-amber-500 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              disabled={isSubmitting}
              rightIcon={isSubmitting ? undefined : <ArrowRight className="w-4 h-4" />}
            >
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </Button>
          </form>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="text-xs text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500"
            >
              {showHint ? 'Ẩn' : 'Hiển thị'} tài khoản demo
            </button>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg space-y-1.5"
              >
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc.email, acc.password)}
                    className="w-full text-left text-xs p-2 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded transition-colors"
                  >
                    <span className="font-semibold text-amber-800 dark:text-amber-300">{acc.label}:</span>{' '}
                    <span className="font-mono text-amber-700 dark:text-amber-400">{acc.email} / {acc.password}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200 dark:border-zinc-700 text-center text-sm text-stone-600 dark:text-stone-400">
            Chưa có tài khoản?{' '}
            <Link to="/auth/register" className="text-amber-700 dark:text-amber-500 hover:underline font-medium">
              Đăng ký ngay
            </Link>
          </div>
        </Card>

        <p className="text-center text-xs text-stone-500 dark:text-stone-400 mt-6">
          Bằng việc đăng nhập, bạn đồng ý với{' '}
          <Link to="/terms" className="hover:underline">Điều khoản</Link> và{' '}
          <Link to="/privacy" className="hover:underline">Chính sách</Link> của chúng tôi.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
