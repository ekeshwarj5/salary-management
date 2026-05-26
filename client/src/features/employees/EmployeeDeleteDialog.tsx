import type { Employee } from '@salary/shared';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { useDeleteEmployeeMutation } from './hooks';

export interface EmployeeDeleteDialogProps {
  employee: Employee | null;
  onClose: () => void;
}

export const EmployeeDeleteDialog = ({ employee, onClose }: EmployeeDeleteDialogProps) => {
  const remove = useDeleteEmployeeMutation();

  const confirm = async () => {
    if (!employee) return;
    try {
      await remove.mutateAsync(employee.id);
      onClose();
    } catch {
      // Error is rendered inline below; nothing extra to do here.
    }
  };

  return (
    <Dialog
      open={employee !== null}
      onClose={onClose}
      title="Delete employee"
      description="This action cannot be undone."
      className="max-w-md"
    >
      <p className="text-sm">
        Remove <span className="font-medium">{employee?.fullName ?? ''}</span> from the
        directory?
      </p>

      {remove.isError && (
        <div className="mt-3 rounded-md border border-[var(--color-danger)] bg-red-50 px-3 py-2 text-xs text-[var(--color-danger)]">
          {remove.error.message}
        </div>
      )}

      <div className="mt-4 flex justify-end gap-2 border-t border-[var(--color-border)] pt-3">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant="danger" onClick={confirm} disabled={remove.isPending}>
          {remove.isPending ? 'Deleting…' : 'Delete'}
        </Button>
      </div>
    </Dialog>
  );
};
