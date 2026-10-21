import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getApiErrorMessage } from '../../../api/client';
import type { CustomerResponse } from '../../../api/types';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { useToast } from '../../../shared/ui/Toast';
import { useUpdateCustomer } from '../hooks/useCustomers';
import {
  createCustomerSchema,
  type CreateCustomerForm,
} from '../validation';

interface CustomerEditFormProps {
  customer: CustomerResponse;
  onCancel: () => void;
}

export function CustomerEditForm({ customer, onCancel }: CustomerEditFormProps) {
  const updateCustomer = useUpdateCustomer();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCustomerForm>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: customer.name,
      email: customer.email,
    },
  });

  const onSubmit = (values: CreateCustomerForm) => {
    updateCustomer.mutate(
      { id: customer.id, payload: values },
      {
        onSuccess: () => {
          showToast('Cliente actualizado correctamente.', 'success');
          onCancel();
        },
        onError: (error) => {
          showToast(getApiErrorMessage(error), 'error');
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-md flex-col gap-4">
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

      {updateCustomer.isError && (
        <p className="text-sm text-status-cancelled" role="alert">
          {getApiErrorMessage(updateCustomer.error)}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={updateCustomer.isPending}>
          {updateCustomer.isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={updateCustomer.isPending}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
