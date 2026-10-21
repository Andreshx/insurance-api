import { expect, test } from '@playwright/test';
import { createCustomerViaApi, createPolicyViaApi } from './fixtures/api';

test.describe('Flujo de pólizas', () => {
  test('crea una póliza desde el detalle del cliente con toast de éxito', async ({
    page,
    request,
  }) => {
    const customer = await createCustomerViaApi(request, { name: 'Cliente Nueva Póliza' });

    await page.goto(`/customers/${customer.id}`);
    await page.getByRole('link', { name: 'Nueva póliza' }).click();

    await expect(page).toHaveURL(new RegExp(`/policies/${customer.id}/create$`));
    await expect(page.getByRole('heading', { name: 'Nueva póliza' })).toBeVisible();

    // El cliente viene precargado y el selector está deshabilitado
    const customerSelect = page.getByLabel('Cliente');
    await expect(customerSelect).toBeDisabled();

    await page.getByLabel('Ramo').selectOption('AUTO');
    await page.getByRole('button', { name: 'Crear póliza' }).click();

    await expect(
      page.getByRole('status').filter({ hasText: 'Póliza creada correctamente.' }),
    ).toBeVisible();

    // Redirige al detalle de la póliza con estado inicial Cotizada
    await expect(page).toHaveURL(/\/policies\/[0-9a-f-]+$/);
    await expect(page.getByText('Cotizada')).toBeVisible();
  });

  test('cambia el estado desde el detalle de la póliza con toast', async ({ page, request }) => {
    const customer = await createCustomerViaApi(request, { name: 'Cliente Estado Detalle' });
    const policy = await createPolicyViaApi(request, customer.id);

    await page.goto(`/policies/${policy.id}`);
    await expect(page.getByRole('heading', { name: policy.policyNumber })).toBeVisible();

    await page.getByLabel('Nuevo estado').selectOption('ISSUED');
    await page.getByRole('button', { name: 'Aplicar cambio' }).click();

    await expect(
      page.getByRole('status').filter({
        hasText: `La póliza ${policy.policyNumber} pasó a Emitida.`,
      }),
    ).toBeVisible();
    await expect(page.getByText('Emitida', { exact: true })).toBeVisible();
  });

  test('la lista de pólizas muestra las pólizas creadas', async ({ page, request }) => {
    const customer = await createCustomerViaApi(request, { name: 'Cliente Lista Pólizas' });
    const policy = await createPolicyViaApi(request, customer.id, { branch: 'HEALTH' });

    await page.goto('/policies');

    await expect(page.getByRole('heading', { name: 'Pólizas' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: policy.policyNumber }),
    ).toBeVisible();
  });
});
