import { apiClient } from '../../../api/client';
import type {
  CreateCustomerRequest,
  CustomerResponse,
  UpdateCustomerRequest,
} from '../../../api/types';

export async function getCustomers(): Promise<CustomerResponse[]> {
  const { data } = await apiClient.get<CustomerResponse[]>('/customers');
  return data;
}

export async function getCustomerById(id: string): Promise<CustomerResponse> {
  const { data } = await apiClient.get<CustomerResponse>(`/customers/${id}`);
  return data;
}

export async function createCustomer(
  payload: CreateCustomerRequest,
): Promise<CustomerResponse> {
  const { data } = await apiClient.post<CustomerResponse>('/customers', payload);
  return data;
}

export async function updateCustomer(
  id: string,
  payload: UpdateCustomerRequest,
): Promise<CustomerResponse> {
  const { data } = await apiClient.patch<CustomerResponse>(
    `/customers/${id}`,
    payload,
  );
  return data;
}
