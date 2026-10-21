import { expect, test } from '@playwright/test';
import { createCustomerViaApi, createPolicyViaApi } from './fixtures/api';

test.describe('Cambio de estado de póliza desde el detalle del cliente', () => {
  test('cambia el estado inline (QUOTED → ISSUED) y muestra el toast', async ({
    page,
    request,
  }) => {
    const customer = await createCustomerViaApi(request, { name: 'Cliente Con Póliza' });
    const policy = await createPolicyViaApi(request, customer.id);

    await page.goto(`/customers/${customer.id}`);

    const row = page.getByRole('row', { name: new RegExp(policy.policyNumber) });
    await expect(row).toBeVisible();
    // Estado inicial
    await expect(row.getByText('Cotizada')).toBeVisible();

    // El selector inline solo ofrece las transiciones válidas del state machine
    const statusSelect = row.getByRole('combobox', {
      name: `Cambiar estado de la póliza ${policy.policyNumber}`,
    });
    await expect(statusSelect).toBeVisible();
    await expect(statusSelect.locator('option')).toContainText([
      'Cambiar estado…',
      'Emitida',
      'Cancelada',
    ]);

    await statusSelect.selectOption('ISSUED');

    // Toast arriba a la derecha tras el cambio exitoso
    await expect(
      page.getByRole('status').filter({
        hasText: `La póliza ${policy.policyNumber} pasó a Emitida.`,
      }),
    ).toBeVisible();

    // La fila refleja el nuevo estado y las nuevas transiciones
    await expect(row.getByText('Emitida')).toBeVisible();
    await expect(statusSelect.locator('option')).toContainText([
      'Cambiar estado…',
      'Activa',
      'Cancelada',
    ]);
  });

  test('una póliza cancelada no ofrece cambios (estado final)', async ({ page, request }) => {
    const customer = await createCustomerViaApi(request, { name: 'Cliente Cancelado' });
    const policy = await createPolicyViaApi(request, customer.id);

    // Cancelamos vía UI
    await page.goto(`/customers/${customer.id}`);
    const row = page.getByRole('row', { name: new RegExp(policy.policyNumber) });
    const statusSelect = row.getByRole('combobox', {
      name: `Cambiar estado de la póliza ${policy.policyNumber}`,
    });
    await statusSelect.selectOption('CANCELLED');
    await expect(row.getByText('Cancelada')).toBeVisible();

    // Ya no hay selector: se muestra el guion de estado final
    await expect(
      row.getByRole('combobox', {
        name: `Cambiar estado de la póliza ${policy.policyNumber}`,
      }),
    ).toHaveCount(0);
    await expect(row.getByText('—')).toBeVisible();
  });

  test('lista las pólizas del cliente con su ramo y prima', async ({ page, request }) => {
    const customer = await createCustomerViaApi(request, { name: 'Cliente Con Ramo' });
    await createPolicyViaApi(request, customer.id, { branch: 'LIFE' });

    await page.goto(`/customers/${customer.id}`);

    const table = page.getByRole('table');
    await expect(table.getByRole('columnheader', { name: 'Ramo' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Acciones' })).toBeVisible();
    await expect(table.getByText('Vida')).toBeVisible();
  });

  test('muestra el estado vacío si el cliente no tiene pólizas', async ({ page, request }) => {
    const customer = await createCustomerViaApi(request, { name: 'Cliente Sin Pólizas' });

    await page.goto(`/customers/${customer.id}`);

    await expect(page.getByText('Este cliente aún no tiene pólizas.')).toBeVisible();
  });
});
