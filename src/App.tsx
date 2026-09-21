import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import AppRoutes from '@/routes/AppRoutes';
import { Spinner } from '@/components/ui/Spinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense fallback={<Spinner />}>
            <AppRoutes />
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
