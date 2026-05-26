import type { Employee } from '@salary/shared';
import { formatCurrency, formatDate } from '../../lib/format';
import { Button } from '../../components/ui/Button';

export interface EmployeesTableProps {
  rows: Employee[];
  isLoading: boolean;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
}

export const EmployeesTable = ({ rows, isLoading, onEdit, onDelete }: EmployeesTableProps) => {
  if (rows.length === 0 && !isLoading) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-white py-12 text-center text-sm text-[var(--color-muted)]">
        No employees match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-[var(--color-muted)]">
          <tr>
            <th className="px-4 py-2 font-medium">Name</th>
            <th className="px-4 py-2 font-medium">Job title</th>
            <th className="px-4 py-2 font-medium">Department</th>
            <th className="px-4 py-2 font-medium">Country</th>
            <th className="px-4 py-2 text-right font-medium">Salary</th>
            <th className="px-4 py-2 font-medium">Joined</th>
            <th className="px-4 py-2 font-medium">Email</th>
            {(onEdit || onDelete) && <th className="px-4 py-2 text-right font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((employee) => (
            <tr key={employee.id} className="border-t border-[var(--color-border)]">
              <td className="px-4 py-2 font-medium">{employee.fullName}</td>
              <td className="px-4 py-2">{employee.jobTitle}</td>
              <td className="px-4 py-2">{employee.department}</td>
              <td className="px-4 py-2">{employee.country}</td>
              <td className="px-4 py-2 text-right tabular-nums">
                {formatCurrency(employee.salary, employee.currency)}
              </td>
              <td className="px-4 py-2 text-[var(--color-muted)]">
                {formatDate(employee.joinedAt)}
              </td>
              <td className="px-4 py-2 text-[var(--color-muted)]">{employee.email}</td>
              {(onEdit || onDelete) && (
                <td className="px-4 py-2">
                  <div className="flex justify-end gap-1">
                    {onEdit && (
                      <Button size="sm" variant="ghost" onClick={() => onEdit(employee)}>
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button size="sm" variant="ghost" onClick={() => onDelete(employee)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
