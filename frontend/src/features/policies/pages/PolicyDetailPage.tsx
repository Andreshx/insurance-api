import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/client';
import type { PolicyStatus } from '../../../api/types';
import { formatCurrency, formatDate } from '../../../shared/lib/format';
import { Button } from '../../../shared/ui/Button';
import { Select } from '../../../shared/ui/Select';
import { Spinner } from '../../../shared/ui/Spinner';
import { StatusChip, statusLabels, validTransitions } from '../../../shared/ui/StatusChip';
import { useChangePolicyStatus, usePolicy } from '../hooks/usePolicies';
import { branchLabels, strategyLabels } from '../validation';

export function PolicyDetailPage() {
  const { id = '' } = useParams();
  const { data: policy, isLoading, error } = usePolicy(id);
  const changeStatus = useChangePolicyStatus();
  const [targetStatus, setTargetStatus] = useState<PolicyStatus | ''>('');

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-status-cancelled" role="alert">
          {getApiErrorMessage(error)}
        </p>
        <Link to="/policies">
          <Button variant="secondary">Volver a pólizas</Button>
        </Link>
      </div>
    );
  }

  if (!policy) return null;

  const transitions = validTransitions[policy.status];

  const handleStatusChange = () => {
    if (!targetStatus) return;
    changeStatus.mutate(
      { id: policy.id, targetStatus },
      {
        onSuccess: () => setTargetStatus(''),
      },
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-2xl font-bold">{policy.policyNumber}</h1>
          <StatusChip status={policy.status} />
        </div>
        <Link to={`/customers/${policy.customerId}`}>
          <Button variant="secondary">Ver cliente</Button>
        </Link>
      </div>

      <section className="grid gap-4 rounded-lg border border-line bg-card p-6 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-sm text-ink-soft">Ramo</p>
          <p>{branchLabels[policy.branch] ?? policy.branch}</p>
        </div>
        <div>
          <p className="text-sm text-ink-soft">Estrategia de pricing</p>
          <p>{strategyLabels[policy.ratingStrategy] ?? policy.ratingStrategy}</p>
        </div>
        <div>
          <p className="text-sm text-ink-soft">Prima mensual</p>
          <p className="text-lg font-semibold text-primary">
            {formatCurrency(policy.monthlyPremium)}
          </p>
        </div>
        <div>
          <p className="text-sm text-ink-soft">Cobertura</p>
          <p>{formatCurrency(Number(policy.coverage.coverageAmount ?? 0))}</p>
        </div>
        <div>
          <p className="text-sm text-ink-soft">Creado</p>
          <p>{formatDate(policy.createdAt)}</p>
        </div>
        <div>
          <p className="text-sm text-ink-soft">Última actualización</p>
          <p>{formatDate(policy.updatedAt)}</p>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-line bg-card p-6">
        <h2 className="text-lg font-semibold">Cambiar estado</h2>
        {transitions.length === 0 ? (
          <p className="text-ink-soft">
            Esta póliza está cancelada; su estado ya no puede cambiar.
          </p>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-56">
              <Select
                id="targetStatus"
                label="Nuevo estado"
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value as PolicyStatus | '')}
                options={[
                  { value: '', label: 'Selecciona un estado…' },
                  ...transitions.map((t) => ({ value: t, label: statusLabels[t] })),
                ]}
              />
            </div>
            <Button
              onClick={handleStatusChange}
              disabled={!targetStatus || changeStatus.isPending}
            >
              {changeStatus.isPending ? 'Aplicando…' : 'Aplicar cambio'}
            </Button>
          </div>
        )}
        {changeStatus.isError && (
          <p className="text-sm text-status-cancelled" role="alert">
            {getApiErrorMessage(changeStatus.error)}
          </p>
        )}
        {changeStatus.isSuccess && (
          <p className="text-sm text-status-active" role="status">
            Estado actualizado a {statusLabels[policy.status]}.
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Perfil de riesgo</h2>
        <pre className="overflow-x-auto rounded-lg border border-line bg-card p-4 text-sm">
          {JSON.stringify(policy.riskProfile, null, 2)}
        </pre>
      </section>
    </div>
  );
}
