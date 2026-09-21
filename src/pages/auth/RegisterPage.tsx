import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Phone, Coffee, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    email: z.string().email('Email không hợp lệ'),
    phone: z
      .string()
      .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ')
      .optional()
      .or(z.literal('')),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: 'Bạn phải đồng ý với điều khoản' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
type RegisterData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.register);
  const pushNotification = useUIStore((s) => s.pushNotification);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    const result = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || undefined,
    });
    if (result.success) {
      pushNotification({ type: 'success', title: 'Đăng ký thành công', message: 'Chào mừng bạn đến với Coffee Home Blend!' });
      navigate('/profile');
    } else {
      pushNotification({ type: 'error', title: 'Đăng ký thất bại', message: result.message ?? 'Lỗi đăng ký' });
    }
  };

  const passwordStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (!pwd) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 2) return { label: 'Yếu', color: 'bg-red-500', width: '33%' };
    if (score <= 3) return { label: 'Trung bình', color: 'bg-yellow-500', width: '66%' };
    return { label: 'Mạnh', color: 'bg-emerald-500', width: '100%' };
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
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Tạo Tài Khoản</h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">Đăng ký để nhận nhiều ưu đãi hấp dẫn</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              leftIcon={<User className="w-4 h-4" />}
              {...register('name')}
              error={errors.name?.message}
              autoComplete="name"
            />
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
              label="Số điện thoại (tùy chọn)"
              type="tel"
              placeholder="0901234567"
              leftIcon={<Phone className="w-4 h-4" />}
              {...register('phone')}
              error={errors.phone?.message}
              autoComplete="tel"
            />
            <div>
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                leftIcon={<Lock className="w-4 h-4" />}
                {...register('password')}
                error={errors.password?.message}
                autoComplete="new-password"
              />
              <PasswordStrengthIndicator password={String((typeof window !== 'undefined') ? (document.querySelector('input[name="password"]') as HTMLInputElement)?.value : '') || ''} />
            </div>
            <Input
              label="Xác nhận mật khẩu"
              type="password"
              placeholder="Nhập lại mật khẩu"
              leftIcon={<Lock className="w-4 h-4" />}
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
            />

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('terms')}
                className="mt-1 w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-stone-700 dark:text-stone-300">
                Tôi đồng ý với{' '}
                <Link to="/terms" className="text-amber-700 dark:text-amber-500 hover:underline">Điều khoản dịch vụ</Link>{' '}
                và{' '}
                <Link to="/privacy" className="text-amber-700 dark:text-amber-500 hover:underline">Chính sách bảo mật</Link>
              </span>
            </label>
            {errors.terms && (
              <p className="text-sm text-red-500 -mt-2" role="alert">{errors.terms.message}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              disabled={isSubmitting}
              rightIcon={isSubmitting ? undefined : <ArrowRight className="w-4 h-4" />}
            >
              {isSubmitting ? 'Đang đăng ký...' : 'Đăng Ký'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-200 dark:border-zinc-700 text-center text-sm text-stone-600 dark:text-stone-400">
            Đã có tài khoản?{' '}
            <Link to="/auth/login" className="text-amber-700 dark:text-amber-500 hover:underline font-medium">
              Đăng nhập
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const [value, setValue] = React.useState(password);
  React.useEffect(() => {
    const handler = setInterval(() => {
      const input = document.querySelector('input[name="password"]') as HTMLInputElement | null;
      if (input && input.value !== value) setValue(input.value);
    }, 200);
    return () => clearInterval(handler);
  }, [value]);
  if (!value) return null;
  let score = 0;
  if (value.length >= 6) score++;
  if (value.length >= 10) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  let label = 'Yếu';
  let color = 'bg-red-500';
  let width = '33%';
  if (score <= 2) { label = 'Yếu'; color = 'bg-red-500'; width = '33%'; }
  else if (score <= 3) { label = 'Trung bình'; color = 'bg-yellow-500'; width = '66%'; }
  else { label = 'Mạnh'; color = 'bg-emerald-500'; width = '100%'; }
  return (
    <div className="mt-1.5">
      <div className="h-1 bg-stone-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-300`} style={{ width }} />
      </div>
      <p className="mt-1 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
        <Check className="w-3 h-3" />
        Độ mạnh mật khẩu: {label}
      </p>
    </div>
  );
};

export default RegisterPage;
