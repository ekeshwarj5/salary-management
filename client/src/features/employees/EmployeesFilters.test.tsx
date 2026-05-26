import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeesFilters } from './EmployeesFilters';

const baseProps = {
  values: { search: '', country: '', jobTitle: '' },
  onChange: vi.fn(),
  onReset: vi.fn(),
  options: { countries: ['IN', 'US'], jobTitles: ['Designer', 'Engineer'] },
  isLoadingOptions: false,
};

describe('EmployeesFilters', () => {
  it('renders the country and job title options from props', () => {
    render(<EmployeesFilters {...baseProps} onChange={vi.fn()} onReset={vi.fn()} />);

    expect(screen.getByRole('option', { name: 'IN' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'US' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Engineer' })).toBeInTheDocument();
  });

  it('emits onChange when the search input is typed into', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EmployeesFilters {...baseProps} onChange={onChange} />);

    await user.type(screen.getByPlaceholderText(/search by name/i), 'a');

    expect(onChange).toHaveBeenCalledWith({ search: 'a' });
  });

  it('emits onChange when a country is selected', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<EmployeesFilters {...baseProps} onChange={onChange} />);

    await user.selectOptions(screen.getByLabelText(/filter by country/i), 'IN');

    expect(onChange).toHaveBeenCalledWith({ country: 'IN' });
  });

  it('disables the Clear button when no filter is active', () => {
    render(<EmployeesFilters {...baseProps} onReset={vi.fn()} />);

    expect(screen.getByRole('button', { name: /clear/i })).toBeDisabled();
  });

  it('enables Clear and calls onReset when a filter is active', async () => {
    const onReset = vi.fn();
    const user = userEvent.setup();
    render(
      <EmployeesFilters
        {...baseProps}
        values={{ search: 'jane', country: '', jobTitle: '' }}
        onReset={onReset}
      />,
    );

    const button = screen.getByRole('button', { name: /clear/i });
    expect(button).toBeEnabled();
    await user.click(button);

    expect(onReset).toHaveBeenCalled();
  });
});
