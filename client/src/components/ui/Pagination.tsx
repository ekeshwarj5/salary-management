import { Button } from './Button';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ page, pageSize, total, onPageChange }: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-[var(--color-muted)]">
        {total === 0
          ? 'No employees'
          : `${from.toLocaleString()}–${to.toLocaleString()} of ${total.toLocaleString()}`}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-[var(--color-muted)]">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
