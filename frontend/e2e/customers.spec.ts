import { expect, test } from '@playwright/test';
import { createCustomerViaApi, uniqueEmail } from './fixtures/api';

test.describe('Flujo de clientes', () => {
  test('la navegación principal muestra Clientes y Pólizas', async ({ page }) => {
    await page.goto('/');

    // La ruta raíz redirige a /customers
    await expect(page).toHaveURL(/\/customers$/);
    await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Pólizas', exact: true }),
    ).toBeVisible();
  });

  test('crea un cliente desde cero y muestra el toast de éxito', async ({ page }) => {
    const email = uniqueEmail('creado');

    await page.goto('/customers');
    await page.getByRole('link', { name: 'Crear cliente' }).click();

    await expect(page).toHaveURL(/\/customers\/create$/);
    await expect(page.getByRole('heading', { name: 'Nuevo cliente' })).toBeVisible();

    await page.getByLabel('Nombre').fill('Laura Gómez');
    await page.getByLabel('Correo electrónico').fill(email);
    await page.getByRole('button', { name: 'Crear cliente' }).click();

    // Toast arriba a la derecha
    const toast = page.getByRole('status').filter({ hasText: 'Cliente creado correctamente.' });
    await expect(toast).toBeVisible();

    // Redirige al detalle del cliente recién creado
    await expect(page).toHaveURL(/\/customers\/[0-9a-f-]+$/);
    await expect(page.getByRole('heading', { name: 'Laura Gómez' })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });

  test('valida el formulario antes de enviar (correo inválido)', async ({ page }) => {
    await page.goto('/customers/create');

    await page.getByLabel('Nombre').fill('A');
    await page.getByLabel('Correo electrónico').fill('no-es-un-correo');
    await page.getByRole('button', { name: 'Crear cliente' }).click();

    await expect(
      page.getByText('El nombre debe tener al menos 2 caracteres'),
    ).toBeVisible();
    await expect(page.getByText('Ingresa un correo válido')).toBeVisible();
    // Sigue en la misma página (no navegó)
    await expect(page).toHaveURL(/\/customers\/create$/);
  });

  test('lista los clientes existentes', async ({ page, request }) => {
    const customer = await createCustomerViaApi(request, { name: 'Cliente Listado' });

    await page.goto('/customers');

    const row = page.getByRole('row', { name: new RegExp(customer.email) });
    await expect(row).toBeVisible();
    await expect(row.getByRole('link', { name: 'Cliente Listado' })).toBeVisible();
  });
});
