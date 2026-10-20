import { z } from 'zod';

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Mirrors backend CreatePolicyDto: customerId (UUID), branch (enum), ratingStrategy (enum), riskProfile (object)
export const createPolicySchema = z
  .object({
    customerId: z
      .string()
      .regex(uuidRegex, 'Selecciona un cliente válido'),
    branch: z.enum(['AUTO', 'LIFE', 'HOME', 'HEALTH']),
    ratingStrategy: z.enum(['STANDARD', 'RISK_BASED', 'LOYALTY']),
    // valueAsNumber convierte el campo vacío en NaN; z.number() lo rechaza
    // con el mensaje de "obligatorio" (z.coerce lo convertiría silenciosamente a 0)
    riskScore: z
      .number({ message: 'El puntaje de riesgo es obligatorio' })
      .int('El puntaje debe ser un número entero')
      .min(0, 'El puntaje mínimo es 0')
      .max(100, 'El puntaje máximo es 100')
      .optional(),
    customerSince: z
      .number({ message: 'El año de antigüedad es obligatorio' })
      .int('El año debe ser un número entero')
      .min(1900, 'El año debe ser igual o posterior a 1900')
      // Espejo de la regla del backend: se requieren al menos 2 años de antigüedad
      .max(new Date().getFullYear() - 2, 'La antigüedad mínima es de 2 años')
      .optional(),
  })
  .refine(
    (data) =>
      data.ratingStrategy !== 'RISK_BASED' || data.riskScore !== undefined,
    {
      message: 'El puntaje de riesgo es obligatorio para la estrategia RISK_BASED',
      path: ['riskScore'],
    },
  )
  .refine(
    (data) =>
      data.ratingStrategy !== 'LOYALTY' || data.customerSince !== undefined,
    {
      message:
        'El año de antigüedad es obligatorio para la estrategia LOYALTY',
      path: ['customerSince'],
    },
  );

export type CreatePolicyForm = z.infer<typeof createPolicySchema>;

export const branchLabels: Record<string, string> = {
  AUTO: 'Autos',
  LIFE: 'Vida',
  HOME: 'Hogar',
  HEALTH: 'Salud',
};

export const strategyLabels: Record<string, string> = {
  STANDARD: 'Estándar',
  RISK_BASED: 'Basada en riesgo',
  LOYALTY: 'Por fidelidad',
};
