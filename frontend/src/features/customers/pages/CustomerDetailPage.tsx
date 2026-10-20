import { Link, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/client';
import { formatCurrency, formatDate } from '../../../shared/lib/format';
import { Button } from '../../../shared/ui/Button';
import { Spinner } from '../../../shared/ui/Spinner';
import { StatusChip } from '../../../shared/ui/StatusChip';
import { useCustomer } from '../hooks/useCustomers';
import { usePoliciesByCustomer } from '../../policies/hooks/usePolicies';

export function CustomerDetailPage() {
  const { id = '' } = useParams();
  const { data: customer, isLoading, error } = useCustomer(id);
  const {
    data: policies,
    isLoading: policiesLoading,
    error: policiesError,
    refetch: refetchPolicies,
  } = usePoliciesByCustomer(id);

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-status-cancelled" role="alert">
          {getApiErrorMessage(error)}
        </p>
        <Link to="/customers">
          <Button variant="secondary">Volver a clientes</Button>
        </Link>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{customer.name}</h1>
        <Link
          to={`/policies/${customer.id}/create`}
          className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Nueva póliza
        </Link>
      </div>

      <section className="grid gap-4 rounded-lg border border-line bg-card p-6 sm:grid-cols-2">
        <div>
          <p className="text-sm text-ink-soft">Correo</p>
          <p>{customer.email}</p>
        </div>
        <div>
          <p className="text-sm text-ink-soft">Estado</p>
          <p>{customer.isActive ? 'Activo' : 'Inactivo'}</p>
        </div>
        <div>
          <p className="text-sm text-ink-soft">Creado</p>
          <p>{formatDate(customer.createdAt)}</p>
        </div>
        <div>
          <p className="text-sm text-ink-soft">Última actualización</p>
          <p>{formatDate(customer.updatedAt)}</p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Pólizas</h2>
        {policiesLoading ? (
          <Spinner />
        ) : policiesError ? (
          <div className="flex flex-col items-start gap-2">
            <p className="text-status-cancelled" role="alert">
              {getApiErrorMessage(policiesError)}
            </p>
            <Button variant="secondary" onClick={() => refetchPolicies()}>
              Reintentar
            </Button>
          </div>
        ) : !policies || policies.length === 0 ? (
          <p className="text-ink-soft">Este cliente aún no tiene pólizas.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-line bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink-soft">
                  <th className="px-4 py-3 font-semibold">Número</th>
                  <th className="px-4 py-3 font-semibold">Ramo</th>
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
                    <td className="px-4 py-3">{policy.branch}</td>
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
      </section>
    </div>
  );
}
