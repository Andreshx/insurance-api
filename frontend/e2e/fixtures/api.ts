import type { APIRequestContext } from '@playwright/test';

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000/api';

export interface ApiCustomer {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export interface ApiPolicy {
  id: string;
  policyNumber: string;
  customerId: string;
  status: string;
}

/** Correo único por ejecución para evitar colisiones con datos previos. */
export function uniqueEmail(prefix = 'e2e'): string {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}.${stamp}@example.com`;
}

/** Crea un cliente directamente contra la API (sembrado, no UI). */
export async function createCustomerViaApi(
  request: APIRequestContext,
  overrides: { name?: string; email?: string } = {},
): Promise<ApiCustomer> {
  const response = await request.post(`${API_URL}/customers`, {
    data: {
      name: overrides.name ?? 'Cliente E2E',
      email: overrides.email ?? uniqueEmail('customer'),
    },
  });

  if (!response.ok()) {
    throw new Error(
      `No se pudo crear el cliente vía API (${response.status()}): ${await response.text()}`,
    );
  }

  return (await response.json()) as ApiCustomer;
}

/** Crea una póliza directamente contra la API (estado inicial QUOTED). */
export async function createPolicyViaApi(
  request: APIRequestContext,
  customerId: string,
  overrides: {
    branch?: string;
    ratingStrategy?: string;
    riskProfile?: Record<string, unknown>;
  } = {},
): Promise<ApiPolicy> {
  const response = await request.post(`${API_URL}/policies`, {
    data: {
      customerId,
      branch: overrides.branch ?? 'AUTO',
      ratingStrategy: overrides.ratingStrategy ?? 'STANDARD',
      riskProfile: overrides.riskProfile ?? {},
    },
  });

  if (!response.ok()) {
    throw new Error(
      `No se pudo crear la póliza vía API (${response.status()}): ${await response.text()}`,
    );
  }

  return (await response.json()) as ApiPolicy;
}
