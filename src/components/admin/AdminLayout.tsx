import { useState, type ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { cn } from '@/utils/cn';

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AdminLayout({ title, subtitle, children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-950">
      <div className="hidden lg:block">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0">
            <AdminSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div
        className={cn(
          'transition-[padding] duration-300',
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        )}
      >
        <AdminHeader
          title={title}
          subtitle={subtitle}
          onToggleSidebar={() => setMobileOpen(true)}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
