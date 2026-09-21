import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Lock,
  User as UserIcon,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const MOCK_USER = {
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  phone: '0901234567',
};

const passwordSchema = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [profile, setProfile] = useState(MOCK_USER);
  const [passwords, setPasswords] = useState(passwordSchema);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!passwords.currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }

    setPasswordSaved(true);
    setPasswords(passwordSchema);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-amber-600" />
          Cài Đặt Tài Khoản
        </h1>
        <Link to="/profile">
          <Button variant="outline">← Quay lại</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <Card padding="md">
            <nav className="space-y-1">
              {[
                { id: 'profile', label: 'Thông tin cá nhân', icon: UserIcon },
                { id: 'password', label: 'Đổi mật khẩu', icon: Lock },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-zinc-700/50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </aside>

        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card padding="lg">
                <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-1">
                  Thông tin cá nhân
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                  Cập nhật thông tin của bạn
                </p>

                {profileSaved && (
                  <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-lg flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã lưu thông tin thành công
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <Input
                    label="Họ và tên"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    required
                  />
                  <Input
                    label="Số điện thoại"
                    type="text"
                    inputMode="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
                      Lưu thay đổi
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {activeTab === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card padding="lg">
                <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-1">
                  Đổi mật khẩu
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
                  Đảm bảo mật khẩu mới của bạn có ít nhất 6 ký tự
                </p>

                {passwordSaved && (
                  <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-lg flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Đổi mật khẩu thành công
                  </div>
                )}

                {passwordError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm" role="alert">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input
                    label="Mật khẩu hiện tại"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, currentPassword: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Mật khẩu mới"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, newPassword: e.target.value })
                    }
                    helperText="Ít nhất 6 ký tự"
                    required
                  />
                  <Input
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirmPassword: e.target.value })
                    }
                    required
                  />

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
                      Đổi mật khẩu
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
