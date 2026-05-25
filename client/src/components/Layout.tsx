import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '../lib/cn';

const navItem = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-[var(--color-accent)] text-white'
      : 'text-[var(--color-muted)] hover:bg-slate-100',
  );

export const Layout = () => {
  return (
    <div className="min-h-full">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold">Salary Management</h1>
          <nav className="flex items-center gap-2">
            <NavLink to="/employees" className={navItem}>
              Employees
            </NavLink>
            <NavLink to="/insights" className={navItem}>
              Insights
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
};
