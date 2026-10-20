import { z } from 'zod';

// Mirrors backend CreateCustomerDto: name (string, not empty, min 2, max 120),
// email (valid email, max 180)
export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(120, 'El nombre no puede superar los 120 caracteres')
    .nonempty('El nombre es obligatorio'),
  email: z
    .email('Ingresa un correo válido')
    .max(180, 'El correo no puede superar los 180 caracteres'),
});

export type CreateCustomerForm = z.infer<typeof createCustomerSchema>;
