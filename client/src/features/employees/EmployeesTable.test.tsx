import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Employee } from '@salary/shared';
import { EmployeesTable } from './EmployeesTable';

const employee = (overrides: Partial<Employee> = {}): Employee => ({
  id: '00000000-0000-4000-8000-000000000001',
  fullName: 'Jane Doe',
  jobTitle: 'Software Engineer',
  country: 'IN',
  salary: 1_500_000,
  currency: 'INR',
  email: 'jane@example.com',
  department: 'Engineering',
  joinedAt: '2022-04-01',
  ...overrides,
});

describe('EmployeesTable', () => {
  it('renders one row per employee with the key fields', () => {
    render(
      <EmployeesTable
        rows={[
          employee({ id: 'a', fullName: 'Jane Doe', salary: 1_000_000 }),
          employee({ id: 'b', fullName: 'John Smith', salary: 2_500_000 }),
        ]}
        isLoading={false}
      />,
    );

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + two rows
  });

  it('shows an empty-state message when there are no rows and not loading', () => {
    render(<EmployeesTable rows={[]} isLoading={false} />);

    expect(screen.getByText(/no employees match/i)).toBeInTheDocument();
  });

  it('does not show the empty-state while loading (avoids flicker on first load)', () => {
    render(<EmployeesTable rows={[]} isLoading={true} />);

    expect(screen.queryByText(/no employees match/i)).not.toBeInTheDocument();
  });
});
