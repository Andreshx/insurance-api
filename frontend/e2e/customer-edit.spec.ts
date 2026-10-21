import { expect, test } from '@playwright/test';
import { createCustomerViaApi, uniqueEmail } from './fixtures/api';

test.describe('Edición de cliente', () => {
  test('edita nombre y correo y muestra el toast de éxito', async ({ page, request }) => {
    const customer = await createCustomerViaApi(request, { name: 'Nombre Original' });
    const newEmail = uniqueEmail('editado');

    await page.goto(`/customers/${customer.id}`);
    await expect(page.getByRole('heading', { name: 'Nombre Original' })).toBeVisible();

    await page.getByRole('button', { name: 'Editar cliente' }).click();

    const nameInput = page.getByLabel('Nombre');
    await expect(nameInput).toHaveValue('Nombre Original');

    await nameInput.fill('Nombre Editado');
    await page.getByLabel('Correo electrónico').fill(newEmail);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(
      page.getByRole('status').filter({ hasText: 'Cliente actualizado correctamente.' }),
    ).toBeVisible();

    // El detalle refleja los datos nuevos y sale del modo edición
    await expect(page.getByRole('heading', { name: 'Nombre Editado' })).toBeVisible();
    await expect(page.getByText(newEmail)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Editar cliente' })).toBeVisible();
  });

  test('cancelar la edición no guarda cambios', async ({ page, request }) => {
    const customer = await createCustomerViaApi(request, { name: 'Sin Cambios' });

    await page.goto(`/customers/${customer.id}`);
    await page.getByRole('button', { name: 'Editar cliente' }).click();
    await page.getByLabel('Nombre').fill('Nombre Descartado');
    await page.getByRole('button', { name: 'Cancelar' }).click();

    await expect(page.getByRole('heading', { name: 'Sin Cambios' })).toBeVisible();
    await expect(page.getByText('Nombre Descartado')).toHaveCount(0);
  });

  test('muestra un toast de error si el correo ya está en uso', async ({ page, request }) => {
    const taken = await createCustomerViaApi(request, { name: 'Ocupa El Correo' });
    const customer = await createCustomerViaApi(request, { name: 'Otro Cliente' });

    await page.goto(`/customers/${customer.id}`);
    await page.getByRole('button', { name: 'Editar cliente' }).click();
    await page.getByLabel('Correo electrónico').fill(taken.email);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    const notifications = page.getByRole('region', { name: 'Notificaciones' });
    await expect(notifications.getByRole('alert')).toContainText('already exists');
  });
});
