import { apiClient } from '../../../api/client';
import type {
  CreatePolicyRequest,
  PolicyResponse,
  PolicyStatus,
} from '../../../api/types';

export async function getPolicies(): Promise<PolicyResponse[]> {
  const { data } = await apiClient.get<PolicyResponse[]>('/policies');
  return data;
}

export async function getPolicyById(id: string): Promise<PolicyResponse> {
  const { data } = await apiClient.get<PolicyResponse>(`/policies/${id}`);
  return data;
}

export async function getPoliciesByCustomer(
  customerId: string,
): Promise<PolicyResponse[]> {
  const { data } = await apiClient.get<PolicyResponse[]>(
    `/policies/customer/${customerId}`,
  );
  return data;
}

export async function createPolicy(
  payload: CreatePolicyRequest,
): Promise<PolicyResponse> {
  const { data } = await apiClient.post<PolicyResponse>('/policies', payload);
  return data;
}

export async function changePolicyStatus(
  id: string,
  targetStatus: PolicyStatus,
): Promise<PolicyResponse> {
  const { data } = await apiClient.patch<PolicyResponse>(
    `/policies/${id}/status`,
    { targetStatus },
  );
  return data;
}
