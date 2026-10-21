import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/client';
import type { PolicyResponse, PolicyStatus } from '../../../api/types';
import { formatCurrency, formatDate } from '../../../shared/lib/format';
import { Button } from '../../../shared/ui/Button';
import { Spinner } from '../../../shared/ui/Spinner';
import { StatusChip, statusLabels, validTransitions } from '../../../shared/ui/StatusChip';
import { useToast } from '../../../shared/ui/Toast';
import { CustomerEditForm } from '../components/CustomerEditForm';
import { useCustomer } from '../hooks/useCustomers';
import { useChangePolicyStatus, usePoliciesByCustomer } from '../../policies/hooks/usePolicies';
import { branchLabels } from '../../policies/validation';

export function CustomerDetailPage() {
  const { id = '' } = useParams();
  const { data: customer, isLoading, error } = useCustomer(id);
  const {
    data: policies,
    isLoading: policiesLoading,
    error: policiesError,
    refetch: refetchPolicies,
  } = usePoliciesByCustomer(id);
  const changeStatus = useChangePolicyStatus();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activePolicyId, setActivePolicyId] = useState<string | null>(null);
  const [targetStatus, setTargetStatus] = useState<PolicyStatus | ''>('');

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

  const handleStatusChange = (policy: PolicyResponse, target: PolicyStatus) => {
    changeStatus.mutate(
      { id: policy.id, targetStatus: target },
      {
        onSuccess: (updated) => {
          showToast(
            `La póliza ${policy.policyNumber} pasó a ${statusLabels[updated.status]}.`,
            'success',
          );
        },
        onError: (statusError) => {
          showToast(getApiErrorMessage(statusError), 'error');
        },
        onSettled: () => {
          setActivePolicyId(null);
          setTargetStatus('');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{customer.name}</h1>
        <div className="flex gap-3">
          {!isEditing && (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>
              Editar cliente
            </Button>
          )}
          <Link
            to={`/policies/${customer.id}/create`}
            className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Nueva póliza
          </Link>
        </div>
      </div>

      {isEditing ? (
        <section className="rounded-lg border border-line bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Editar cliente</h2>
          <CustomerEditForm
            customer={customer}
            onCancel={() => setIsEditing(false)}
          />
        </section>
      ) : (
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
      )}

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
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => {
                  const transitions = validTransitions[policy.status];

                  return (
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
                        <StatusChip status={policy.status} />
                      </td>
                      <td className="px-4 py-3">{formatCurrency(policy.monthlyPremium)}</td>
                      <td className="px-4 py-3">
                        {transitions.length === 0 ? (
                          <span
                            className="text-ink-soft"
                            title="Póliza cancelada: su estado ya no puede cambiar"
                          >
                            —
                          </span>
                        ) : (
                          <select
                            aria-label={`Cambiar estado de la póliza ${policy.policyNumber}`}
                            className="rounded-md border border-line bg-card px-2 py-1.5 text-sm focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            value={activePolicyId === policy.id ? targetStatus : ''}
                            disabled={changeStatus.isPending}
                            onChange={(e) => {
                              const target = e.target.value as PolicyStatus | '';
                              setActivePolicyId(policy.id);
                              setTargetStatus(target);
                              if (target) handleStatusChange(policy, target);
                            }}
                          >
                            <option value="">Cambiar estado…</option>
                            {transitions.map((transition) => (
                              <option key={transition} value={transition}>
                                {statusLabels[transition]}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
