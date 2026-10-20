import { Link } from 'react-router-dom';

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  actionTo?: string;
}

export function EmptyState({ message, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-ink-soft">{message}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
