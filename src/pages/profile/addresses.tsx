import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const AddressesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 py-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-2 flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
          <Link to="/" className="hover:text-amber-700 dark:hover:text-amber-500">
            Trang chủ
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/profile" className="hover:text-amber-700 dark:hover:text-amber-500">
            Tài khoản
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-stone-700 dark:text-stone-200">Sổ địa chỉ</span>
        </nav>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100">Sổ Địa Chỉ</h1>
            <p className="mt-1 text-stone-600 dark:text-stone-400">
              Quản lý địa chỉ giao hàng của bạn
            </p>
          </div>
        </div>

        <Card padding="lg" className="text-center">
          <div className="flex flex-col items-center py-8">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <MapPin className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
              Tính năng đang phát triển
            </h2>
            <p className="mb-4 text-stone-600 dark:text-stone-400">
              Quản lý địa chỉ giao hàng sẽ sớm có mặt
            </p>
            <Link to="/profile">
              <Button variant="outline">Quay lại tài khoản</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AddressesPage;
