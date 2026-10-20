import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PolicyStatus } from '../../../api/types';
import {
  changePolicyStatus,
  createPolicy,
  getPolicies,
  getPoliciesByCustomer,
  getPolicyById,
} from '../api/policies.api';

export function usePolicies() {
  return useQuery({
    queryKey: ['policies'],
    queryFn: getPolicies,
  });
}

export function usePolicy(id: string) {
  return useQuery({
    queryKey: ['policies', id],
    queryFn: () => getPolicyById(id),
    enabled: Boolean(id),
  });
}

export function usePoliciesByCustomer(customerId: string) {
  return useQuery({
    queryKey: ['policies', 'customer', customerId],
    queryFn: () => getPoliciesByCustomer(customerId),
    enabled: Boolean(customerId),
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPolicy,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
}

export function useChangePolicyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, targetStatus }: { id: string; targetStatus: PolicyStatus }) =>
      changePolicyStatus(id, targetStatus),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['policies'] });
    },
  });
}
