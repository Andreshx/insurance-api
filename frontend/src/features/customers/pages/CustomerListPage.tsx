import { Link } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/client';
import { formatDate } from '../../../shared/lib/format';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { Spinner } from '../../../shared/ui/Spinner';
import { useCustomers } from '../hooks/useCustomers';

export function CustomerListPage() {
  const { data: customers, isLoading, error, refetch } = useCustomers();

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
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
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Link to="/customers/create">
          <Button>Crear cliente</Button>
        </Link>
      </div>

      {!customers || customers.length === 0 ? (
        <EmptyState
          message="Aún no hay clientes registrados."
          actionLabel="Crear el primero"
          actionTo="/customers/create"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-ink-soft">
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Correo</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Creado</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-line last:border-0 hover:bg-surface">
                  <td className="px-4 py-3">
                    <Link
                      to={`/customers/${customer.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{customer.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        customer.isActive
                          ? 'bg-status-active/10 text-status-active'
                          : 'bg-status-quoted/10 text-status-quoted'
                      }`}
                    >
                      {customer.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(customer.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
