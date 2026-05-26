import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Employee } from '@salary/shared';
import { EmployeeDeleteDialog } from './EmployeeDeleteDialog';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
});

const employee: Employee = {
  id: '00000000-0000-4000-8000-000000000001',
  fullName: 'Jane Doe',
  jobTitle: 'Engineer',
  country: 'IN',
  salary: 1_000_000,
  currency: 'INR',
  email: 'jane@example.com',
  department: 'Engineering',
  joinedAt: '2022-04-01',
};

const renderWithClient = (ui: React.ReactNode) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('EmployeeDeleteDialog', () => {
  it('shows the target employee name in the prompt', () => {
    renderWithClient(<EmployeeDeleteDialog employee={employee} onClose={vi.fn()} />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
  });

  it('Cancel triggers onClose without calling the API', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithClient(<EmployeeDeleteDialog employee={employee} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
