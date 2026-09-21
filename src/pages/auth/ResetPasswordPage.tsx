import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Coffee, ArrowLeft, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useUIStore } from '@/stores/uiStore';

const schema = z
  .object({
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
type FormData = z.infer<typeof schema>;

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pushNotification = useUIStore((s) => s.pushNotification);
  const token = searchParams.get('token');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      pushNotification({
        type: 'error',
        title: 'Liên kết không hợp lệ',
        message: 'Vui lòng yêu cầu đặt lại mật khẩu lại.',
      });
      navigate('/auth/forgot-password');
      return;
    }
    await new Promise((r) => setTimeout(r, 700));
    setSuccess(true);
    setTimeout(() => navigate('/auth/login'), 2000);
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
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Đặt Lại Mật Khẩu</h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Tạo mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        <Card padding="lg">
          {success ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">Thành Công!</h2>
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
                Mật khẩu của bạn đã được cập nhật.
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Đang chuyển hướng đến trang đăng nhập...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!token && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Token không hợp lệ - bạn sẽ được chuyển đến trang yêu cầu đặt lại sau khi gửi.
                  </p>
                </div>
              )}
              <Input
                label="Mật khẩu mới"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                leftIcon={<Lock className="w-4 h-4" />}
                {...register('password')}
                error={errors.password?.message}
                autoComplete="new-password"
              />
              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                placeholder="Nhập lại mật khẩu"
                leftIcon={<Lock className="w-4 h-4" />}
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang cập nhật...' : 'Đặt Lại Mật Khẩu'}
              </Button>
              <Link to="/auth/login" className="block">
                <Button type="button" variant="ghost" fullWidth leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Quay lại đăng nhập
                </Button>
              </Link>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
