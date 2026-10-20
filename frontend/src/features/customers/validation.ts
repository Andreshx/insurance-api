import { z } from 'zod';

// Mirrors backend CreateCustomerDto: name (string, not empty, min 2), email (valid email)
export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .nonempty('El nombre es obligatorio'),
  email: z.email('Ingresa un correo válido'),
});

export type CreateCustomerForm = z.infer<typeof createCustomerSchema>;
