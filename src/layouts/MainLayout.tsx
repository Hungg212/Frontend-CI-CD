import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastContainer } from '@/components/ui/Toast';

export default function MainLayout() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50 dark:bg-zinc-900">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </>
  );
}
