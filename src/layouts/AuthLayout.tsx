import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4 dark:bg-zinc-900">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <svg
            viewBox="0 0 40 40"
            className="h-12 w-12 text-amber-700 dark:text-amber-500"
            fill="currentColor"
          >
            <path d="M8 8h24v4c0 8.837-7.163 16-16 16S0 20.837 0 12V8h8zm0 4v4h24V12H8zm2 8v16c0 6.627 5.373 12 12 12s12-5.373 12-12V20H10z" />
            <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
            Coffee Home Blend
          </span>
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
