import { useEffect } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateEmployeeSchema, type CreateEmployee } from '@salary/shared';
import { Dialog } from '../../components/ui/Dialog';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ApiError } from '../../lib/api';
import { useCreateEmployeeMutation } from './hooks';

export interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
}

const blankPayload: CreateEmployee = {
  fullName: '',
  jobTitle: '',
  country: '',
  salary: 0,
  currency: '',
  email: '',
  department: '',
  joinedAt: '',
};

export const EmployeeFormDialog = ({ open, onClose }: EmployeeFormDialogProps) => {
  const create = useCreateEmployeeMutation();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateEmployee>({
    resolver: zodResolver(CreateEmployeeSchema),
    defaultValues: blankPayload,
  });

  // Reset the form whenever the dialog reopens so partial input from
  // a previous attempt doesn't carry over. `reset` and `create.reset`
  // are stable identities; depending on the `create` object would
  // re-fire this effect on every mutation state change.
  useEffect(() => {
    if (open) {
      reset(blankPayload);
      create.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create.mutateAsync(values);
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.body.issues) {
        for (const issue of err.body.issues) {
          const path = issue.path.join('.') as FieldPath<CreateEmployee>;
          setError(path, { type: 'server', message: issue.message });
        }
      }
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Add employee"
      description="All fields are required. Country and currency use ISO codes."
    >
      <form onSubmit={onSubmit} className="space-y-3">
        <Field label="Full name" htmlFor="fullName" error={errors.fullName?.message}>
          <Input id="fullName" autoFocus {...register('fullName')} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Job title" htmlFor="jobTitle" error={errors.jobTitle?.message}>
            <Input id="jobTitle" {...register('jobTitle')} />
          </Field>
          <Field label="Department" htmlFor="department" error={errors.department?.message}>
            <Input id="department" {...register('department')} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Country"
            htmlFor="country"
            hint="ISO-3166-1 alpha-2 (e.g. IN)"
            error={errors.country?.message}
          >
            <Input id="country" maxLength={2} {...register('country')} />
          </Field>
          <Field
            label="Currency"
            htmlFor="currency"
            hint="ISO-4217 (e.g. INR)"
            error={errors.currency?.message}
          >
            <Input id="currency" maxLength={3} {...register('currency')} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Salary" htmlFor="salary" error={errors.salary?.message}>
            <Input
              id="salary"
              type="number"
              min={1}
              step="any"
              {...register('salary', { valueAsNumber: true })}
            />
          </Field>
          <Field label="Joined" htmlFor="joinedAt" error={errors.joinedAt?.message}>
            <Input id="joinedAt" type="date" {...register('joinedAt')} />
          </Field>
        </div>

        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register('email')} />
        </Field>

        {create.isError && !(create.error instanceof ApiError && create.error.body.issues) && (
          <div className="rounded-md border border-[var(--color-danger)] bg-red-50 px-3 py-2 text-xs text-[var(--color-danger)]">
            {create.error.message}
          </div>
        )}

        <div className="mt-2 flex justify-end gap-2 border-t border-[var(--color-border)] pt-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Add employee'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
