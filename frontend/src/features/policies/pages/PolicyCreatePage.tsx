import { useParams } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/client';
import { useCustomers } from '../../customers/hooks/useCustomers';
import { Button } from '../../../shared/ui/Button';
import { Spinner } from '../../../shared/ui/Spinner';
import { PolicyForm } from '../components/PolicyForm';

export function PolicyCreatePage() {
  const { customerId } = useParams();
  const { data: customers, isLoading, error, refetch } = useCustomers();

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Nueva póliza</h1>
        <p className="text-status-cancelled" role="alert">
          {getApiErrorMessage(error)}
        </p>
        <div>
          <Button variant="secondary" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const customerOptions = (customers ?? []).map((c) => ({
    value: c.id,
    label: `${c.name} — ${c.email}`,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Nueva póliza</h1>
      {customerOptions.length === 0 ? (
        <p className="text-ink-soft">
          Primero crea un cliente para poder registrar una póliza.
        </p>
      ) : (
        <PolicyForm customerOptions={customerOptions} defaultCustomerId={customerId} />
      )}
    </div>
  );
}
