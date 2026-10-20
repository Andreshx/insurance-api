import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Extract a human-readable message from an API error response. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message;
    }
    if (error.code === 'ECONNREFUSED') {
      return 'No se pudo conectar con el servidor. Verifica que la API esté corriendo.';
    }
  }
  return 'Ocurrió un error inesperado.';
}
