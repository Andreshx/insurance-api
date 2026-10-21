import { defineConfig, devices } from '@playwright/test';

/**
 * E2E del frontend con Playwright.
 *
 * Requisitos:
 * - Backend NestJS corriendo en http://localhost:3000 (npm run start:dev en la raíz)
 * - PostgreSQL y RabbitMQ levantados (docker compose up -d)
 *
 * El `webServer` compila el frontend y lo sirve con `vite preview` en :5173,
 * que es el origen exacto al que apunta el CORS del backend.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
