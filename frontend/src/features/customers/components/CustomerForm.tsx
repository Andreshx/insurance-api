import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/client';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { useCreateCustomer } from '../hooks/useCustomers';
import {
  createCustomerSchema,
  type CreateCustomerForm,
} from '../validation';

export function CustomerForm() {
  const navigate = useNavigate();
  const createCustomer = useCreateCustomer();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCustomerForm>({
    resolver: zodResolver(createCustomerSchema),
  });

  const onSubmit = (values: CreateCustomerForm) => {
    createCustomer.mutate(values, {
      onSuccess: (customer) => {
        navigate(`/customers/${customer.id}`);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-md flex-col gap-4">
      <Input
        id="name"
        label="Nombre"
        placeholder="Andres Espinosa"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        id="email"
        label="Correo electrónico"
        type="email"
        placeholder="andres@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      {createCustomer.isError && (
        <p className="text-sm text-status-cancelled" role="alert">
          {getApiErrorMessage(createCustomer.error)}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={createCustomer.isPending}>
          {createCustomer.isPending ? 'Guardando…' : 'Crear cliente'}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/customers')}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
