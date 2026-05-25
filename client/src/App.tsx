import { QueryClientProvider } from '@tanstack/react-query';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { queryClient } from './lib/queryClient';
import { Layout } from './components/Layout';
import { EmployeesPage } from './features/employees/EmployeesPage';
import { InsightsPage } from './features/insights/InsightsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/employees" replace /> },
      { path: 'employees', element: <EmployeesPage /> },
      { path: 'insights', element: <InsightsPage /> },
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
