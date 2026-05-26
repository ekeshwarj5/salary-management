import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EmployeeFormDialog } from './EmployeeFormDialog';

// jsdom doesn't implement <dialog>.showModal / .close; stub them so the
// Dialog effect doesn't throw when toggling open.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
});

const renderWithClient = (ui: React.ReactNode) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('EmployeeFormDialog', () => {
  it('renders every required field when open', () => {
    renderWithClient(<EmployeeFormDialog open onClose={vi.fn()} />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^country$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^currency$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/salary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/joined/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('Cancel button invokes onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithClient(<EmployeeFormDialog open onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
