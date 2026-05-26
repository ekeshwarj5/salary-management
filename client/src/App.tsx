import { lazy, Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import { Layout } from './components/Layout';
import { EmployeesPage } from './features/employees/EmployeesPage';

// Lazy-load Insights so Recharts (~140 kB gzipped) isn't downloaded
// until the user actually opens that page.
const InsightsPage = lazy(() =>
  import('./features/insights/InsightsPage').then((m) => ({ default: m.InsightsPage })),
);

const PageFallback = () => (
  <div className="py-12 text-center text-sm text-[var(--color-muted)]">Loading…</div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/employees" replace /> },
      { path: 'employees', element: <EmployeesPage /> },
      {
        path: 'insights',
        element: (
          <Suspense fallback={<PageFallback />}>
            <InsightsPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};
