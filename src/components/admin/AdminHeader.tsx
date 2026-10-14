import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, Menu, Search, User } from 'lucide-react';
import { cn } from '@/utils/cn';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onToggleSidebar?: () => void;
}

export function AdminHeader({ title, subtitle, onToggleSidebar }: AdminHeaderProps) {
  const [openMenu, setOpenMenu] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setOpenNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifications = [
    { id: 1, title: 'Đơn hàng mới', message: 'ORD-2026-001248 vừa được tạo', time: '2 phút trước' },
    {
      id: 2,
      title: 'Sắp hết hàng',
      message: 'Cà Phê Mokka Cần Thơ còn 78 sản phẩm',
      time: '1 giờ trước',
    },
    { id: 3, title: 'Đánh giá mới', message: 'Có 1 đánh giá đang chờ duyệt', time: '3 giờ trước' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-stone-200 bg-white px-4 lg:px-6 dark:border-zinc-800 dark:bg-zinc-900">
      <button
        onClick={onToggleSidebar}
        className="rounded-lg p-2 hover:bg-stone-100 lg:hidden dark:hover:bg-zinc-800"
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5 text-stone-700 dark:text-stone-300" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold text-stone-800 lg:text-xl dark:text-stone-100">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-xs text-stone-500 dark:text-stone-400">{subtitle}</p>
        )}
      </div>

      <div className="hidden w-64 items-center gap-2 rounded-lg bg-stone-100 px-3 py-2 md:flex dark:bg-zinc-800">
        <Search className="h-4 w-4 text-stone-400" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="flex-1 bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-400 dark:text-stone-200"
        />
      </div>

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setOpenNotif((v) => !v)}
          className="relative rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-zinc-800"
          aria-label="Thông báo"
        >
          <Bell className="h-5 w-5 text-stone-700 dark:text-stone-300" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        {openNotif && (
          <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <div className="border-b border-stone-200 px-4 py-3 dark:border-zinc-700">
              <p className="font-semibold text-stone-800 dark:text-stone-100">Thông báo</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="border-b border-stone-100 px-4 py-3 last:border-0 hover:bg-stone-50 dark:border-zinc-700 dark:hover:bg-zinc-700/50"
                >
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-100">
                    {n.title}
                  </p>
                  <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">{n.message}</p>
                  <p className="mt-1 text-xs text-stone-400">{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpenMenu((v) => !v)}
          className={cn(
            'flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-stone-100 dark:hover:bg-zinc-800'
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            A
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-stone-800 dark:text-stone-100">Admin</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">admin@coffee.vn</p>
          </div>
          <ChevronDown className="h-4 w-4 text-stone-500" />
        </button>
        {openMenu && (
          <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <div className="border-b border-stone-200 px-4 py-3 dark:border-zinc-700">
              <p className="font-medium text-stone-800 dark:text-stone-100">Admin</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">admin@coffee.vn</p>
            </div>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-stone-700 hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-zinc-700"
            >
              <User className="h-4 w-4" />
              Hồ sơ
            </button>
            <button
              type="button"
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default AdminHeader;
