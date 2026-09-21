import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Coffee, ArrowLeft, CheckCircle2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
});
type FormData = z.infer<typeof schema>;

const ForgotPasswordPage: React.FC = () => {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 700));
    setSubmittedEmail(data.email);
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
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Quên Mật Khẩu?</h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Nhập email để nhận liên kết đặt lại mật khẩu
          </p>
        </div>

        <Card padding="lg">
          <AnimatePresence mode="wait">
            {submittedEmail ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-4"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                  Kiểm Tra Email Của Bạn
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">
                  Chúng tôi đã gửi liên kết đặt lại mật khẩu đến
                </p>
                <p className="font-semibold text-amber-700 dark:text-amber-500 mb-6">{submittedEmail}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
                  Vui lòng kiểm tra hộp thư đến (hoặc thư rác) trong vòng vài phút.
                </p>
                <div className="space-y-2">
                  <Link to="/auth/reset-password?token=mock-token" className="block">
                    <Button variant="primary" fullWidth>
                      Tiếp Tục Đặt Lại Mật Khẩu (Demo)
                    </Button>
                  </Link>
                  <Link to="/auth/login" className="block">
                    <Button variant="ghost" fullWidth leftIcon={<ArrowLeft className="w-4 h-4" />}>
                      Quay lại đăng nhập
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  {...register('email')}
                  error={errors.email?.message}
                  autoComplete="email"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  leftIcon={isSubmitting ? undefined : <Send className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi Link Đặt Lại Mật Khẩu'}
                </Button>
                <Link to="/auth/login" className="block">
                  <Button type="button" variant="ghost" fullWidth leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Quay lại đăng nhập
                  </Button>
                </Link>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
