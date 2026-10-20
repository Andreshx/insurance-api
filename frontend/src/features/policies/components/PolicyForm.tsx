import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '../../../api/client';
import type { RatingStrategyName } from '../../../api/types';
import { Button } from '../../../shared/ui/Button';
import { Select } from '../../../shared/ui/Select';
import { Input } from '../../../shared/ui/Input';
import { useToast } from '../../../shared/ui/Toast';
import { useCreatePolicy } from '../hooks/usePolicies';
import {
  branchLabels,
  createPolicySchema,
  strategyLabels,
  type CreatePolicyForm,
} from '../validation';

interface PolicyFormProps {
  customerOptions: { value: string; label: string }[];
  defaultCustomerId?: string;
}

export function PolicyForm({ customerOptions, defaultCustomerId }: PolicyFormProps) {
  const navigate = useNavigate();
  const createPolicy = useCreatePolicy();
  const { showToast } = useToast();
  const [strategy, setStrategy] = useState<RatingStrategyName>('STANDARD');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePolicyForm>({
    // z.input y z.output coinciden: los campos numéricos se registran con
    // valueAsNumber, así que no hace falta castear el resolver
    resolver: zodResolver(createPolicySchema),
    defaultValues: {
      customerId: defaultCustomerId ?? '',
      branch: 'AUTO',
      ratingStrategy: 'STANDARD',
    },
  });

  const onSubmit = (values: CreatePolicyForm) => {
    const riskProfile: Record<string, unknown> = {};
    if (values.ratingStrategy === 'RISK_BASED') {
      riskProfile.riskScore = values.riskScore;
    }
    if (values.ratingStrategy === 'LOYALTY') {
      riskProfile.customerSince = values.customerSince;
    }

    createPolicy.mutate(
      {
        customerId: values.customerId,
        branch: values.branch,
        ratingStrategy: values.ratingStrategy,
        riskProfile,
      },
      {
        onSuccess: (policy) => {
          showToast('Póliza creada correctamente.', 'success');
          navigate(`/policies/${policy.id}`);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-md flex-col gap-4">
      <Select
        id="customerId"
        label="Cliente"
        options={[{ value: '', label: 'Selecciona un cliente…' }, ...customerOptions]}
        error={errors.customerId?.message}
        disabled={Boolean(defaultCustomerId)}
        {...register('customerId')}
      />
      <Select
        id="branch"
        label="Ramo"
        options={Object.entries(branchLabels).map(([value, label]) => ({ value, label }))}
        error={errors.branch?.message}
        {...register('branch')}
      />
      <Select
        id="ratingStrategy"
        label="Estrategia de pricing"
        options={Object.entries(strategyLabels).map(([value, label]) => ({ value, label }))}
        error={errors.ratingStrategy?.message}
        {...register('ratingStrategy', {
          onChange: (e) => setStrategy(e.target.value as RatingStrategyName),
        })}
      />

      {strategy === 'RISK_BASED' && (
        <Input
          id="riskScore"
          label="Puntaje de riesgo (0–100)"
          type="number"
          placeholder="50"
          error={errors.riskScore?.message}
          {...register('riskScore', { valueAsNumber: true })}
          min={0}
          max={100}
          step={1}
        />
      )}

      {strategy === 'LOYALTY' && (
        <Input
          id="customerSince"
          label="Cliente desde (año)"
          type="number"
          placeholder="2020"
          error={errors.customerSince?.message}
          {...register('customerSince', { valueAsNumber: true })}
          min={1900}
          max={new Date().getFullYear() - 2}
          step={1}
        />
      )}

      {createPolicy.isError && (
        <p className="text-sm text-status-cancelled" role="alert">
          {getApiErrorMessage(createPolicy.error)}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={createPolicy.isPending}>
          {createPolicy.isPending ? 'Creando…' : 'Crear póliza'}
        </Button>
        <Button variant="secondary" onClick={() => navigate('/policies')}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
