import type { PolicyStatus } from '../../api/types';

const statusConfig: Record<PolicyStatus, { label: string; className: string }> = {
  QUOTED: { label: 'Cotizada', className: 'bg-status-quoted/10 text-status-quoted' },
  ISSUED: { label: 'Emitida', className: 'bg-status-issued/10 text-status-issued' },
  ACTIVE: { label: 'Activa', className: 'bg-status-active/10 text-status-active' },
  SUSPENDED: { label: 'Suspendida', className: 'bg-status-suspended/10 text-status-suspended' },
  CANCELLED: { label: 'Cancelada', className: 'bg-status-cancelled/10 text-status-cancelled' },
};

export function StatusChip({ status }: { status: PolicyStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

/** Valid status transitions — mirrors the backend state machine. */
export const validTransitions: Record<PolicyStatus, PolicyStatus[]> = {
  QUOTED: ['ISSUED', 'CANCELLED'],
  ISSUED: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['SUSPENDED', 'CANCELLED'],
  SUSPENDED: ['ACTIVE', 'CANCELLED'],
  CANCELLED: [],
};

export const statusLabels: Record<PolicyStatus, string> = {
  QUOTED: 'Cotizada',
  ISSUED: 'Emitida',
  ACTIVE: 'Activa',
  SUSPENDED: 'Suspendida',
  CANCELLED: 'Cancelada',
};
