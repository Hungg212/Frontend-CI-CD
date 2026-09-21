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
    { id: 2, title: 'Sắp hết hàng', message: 'Cà Phê Mokka Cần Thơ còn 78 sản phẩm', time: '1 giờ trước' },
    { id: 3, title: 'Đánh giá mới', message: 'Có 1 đánh giá đang chờ duyệt', time: '3 giờ trước' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800 h-16 flex items-center px-4 lg:px-6 gap-4">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800"
        aria-label="Mở menu"
      >
        <Menu className="w-5 h-5 text-stone-700 dark:text-stone-300" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-lg lg:text-xl font-bold text-stone-800 dark:text-stone-100 truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-stone-500 dark:text-stone-400 truncate">{subtitle}</p>
        )}
      </div>

      <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-100 dark:bg-zinc-800 w-64">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="bg-transparent flex-1 text-sm outline-none text-stone-700 dark:text-stone-200 placeholder:text-stone-400"
        />
      </div>

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setOpenNotif((v) => !v)}
          className="relative p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800"
          aria-label="Thông báo"
        >
          <Bell className="w-5 h-5 text-stone-700 dark:text-stone-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        {openNotif && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-200 dark:border-zinc-700">
              <p className="font-semibold text-stone-800 dark:text-stone-100">Thông báo</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 hover:bg-stone-50 dark:hover:bg-zinc-700/50 border-b border-stone-100 dark:border-zinc-700 last:border-0"
                >
                  <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{n.title}</p>
                  <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-stone-400 mt-1">{n.time}</p>
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
            'flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800'
          )}
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-300 font-semibold">
            A
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-stone-800 dark:text-stone-100">Admin</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">admin@coffee.vn</p>
          </div>
          <ChevronDown className="w-4 h-4 text-stone-500" />
        </button>
        {openMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-200 dark:border-zinc-700">
              <p className="font-medium text-stone-800 dark:text-stone-100">Admin</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">admin@coffee.vn</p>
            </div>
            <button
              type="button"
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-stone-50 dark:hover:bg-zinc-700 flex items-center gap-2 text-stone-700 dark:text-stone-200"
            >
              <User className="w-4 h-4" />
              Hồ sơ
            </button>
            <button
              type="button"
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
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
