import { useEffect } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateEmployeeSchema,
  type CreateEmployee,
  type Employee,
  type UpdateEmployee,
} from '@salary/shared';
import { Dialog } from '../../components/ui/Dialog';
import { Field } from '../../components/ui/Field';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ApiError } from '../../lib/api';
import { useCreateEmployeeMutation, useUpdateEmployeeMutation } from './hooks';

export interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** When provided, dialog is in edit mode and pre-fills from this record. */
  initialValue?: Employee | null;
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

const toFormDefaults = (employee: Employee | null | undefined): CreateEmployee => {
  if (!employee) return blankPayload;
  // Strip id - the form only edits mutable fields.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...rest } = employee;
  return rest;
};

/** Return only the fields that changed between original and current. */
const diffPatch = (original: Employee, current: CreateEmployee): UpdateEmployee => {
  const patch: Partial<CreateEmployee> = {};
  for (const key of Object.keys(current) as Array<keyof CreateEmployee>) {
    if (current[key] !== original[key]) {
      (patch as Record<string, unknown>)[key] = current[key];
    }
  }
  return patch as UpdateEmployee;
};

export const EmployeeFormDialog = ({ open, onClose, initialValue }: EmployeeFormDialogProps) => {
  const isEdit = Boolean(initialValue);
  const create = useCreateEmployeeMutation();
  const update = useUpdateEmployeeMutation();
  const mutation = isEdit ? update : create;

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

  // Reset whenever the dialog reopens or the target employee changes;
  // depending on the mutation object would re-fire this on every state
  // change because the object identity is new each render.
  useEffect(() => {
    if (open) {
      reset(toFormDefaults(initialValue));
      create.reset();
      update.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValue?.id]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (initialValue) {
        const patch = diffPatch(initialValue, values);
        if (Object.keys(patch).length === 0) {
          onClose();
          return;
        }
        await update.mutateAsync({ id: initialValue.id, patch });
      } else {
        await create.mutateAsync(values);
      }
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
      title={isEdit ? 'Edit employee' : 'Add employee'}
      description={
        isEdit
          ? 'Update the fields that need to change. Unchanged fields are not sent.'
          : 'All fields are required. Country and currency use ISO codes.'
      }
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

        {mutation.isError &&
          !(mutation.error instanceof ApiError && mutation.error.body.issues) && (
            <div className="rounded-md border border-[var(--color-danger)] bg-red-50 px-3 py-2 text-xs text-[var(--color-danger)]">
              {mutation.error.message}
            </div>
          )}

        <div className="mt-2 flex justify-end gap-2 border-t border-[var(--color-border)] pt-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Add employee'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
