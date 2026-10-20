import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/client';
import { formatCurrency } from '../../../shared/lib/format';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Spinner } from '../../../shared/ui/Spinner';
import { StatusChip } from '../../../shared/ui/StatusChip';
import { usePolicies } from '../hooks/usePolicies';
import { branchLabels, strategyLabels } from '../validation';

export function PolicyListPage() {
  const { data: policies, isLoading, error, refetch } = usePolicies();

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-bold">Pólizas</h1>
        <p className="text-status-cancelled" role="alert">
          {getApiErrorMessage(error)}
        </p>
        <Button variant="secondary" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pólizas</h1>
        <Link to="/policies/create">
          <Button>Crear póliza</Button>
        </Link>
      </div>

      {!policies || policies.length === 0 ? (
        <EmptyState
          message="Aún no hay pólizas registradas."
          actionLabel="Crear la primera"
          actionTo="/policies/create"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-ink-soft">
                <th className="px-4 py-3 font-semibold">Número</th>
                <th className="px-4 py-3 font-semibold">Ramo</th>
                <th className="px-4 py-3 font-semibold">Estrategia</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Prima mensual</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy.id} className="border-b border-line last:border-0 hover:bg-surface">
                  <td className="px-4 py-3">
                    <Link
                      to={`/policies/${policy.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {policy.policyNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{branchLabels[policy.branch] ?? policy.branch}</td>
                  <td className="px-4 py-3">
                    {strategyLabels[policy.ratingStrategy] ?? policy.ratingStrategy}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={policy.status} />
                  </td>
                  <td className="px-4 py-3">{formatCurrency(policy.monthlyPremium)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
