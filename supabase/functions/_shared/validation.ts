import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Draw name validation schema
export const drawNameSchema = z.string()
  .trim()
  .min(1, 'Draw name is required')
  .max(50, 'Draw name must be less than 50 characters')
  .regex(/^[a-zA-Z0-9\s-]+$/, 'Draw name can only contain letters, numbers, spaces and hyphens');

// Request schemas for different endpoints
export const predictionRequestSchema = z.object({
  drawName: drawNameSchema,
  analysisDepth: z.number().int().min(10).max(1000).optional().default(100),
});

export const autoTuneRequestSchema = z.object({
  drawName: drawNameSchema.optional(),
});

export const evaluatePredictionsRequestSchema = z.object({
  drawName: drawNameSchema.optional(),
});

// Validation helper function
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errorMessages };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Convenience function for draw name validation
export function validateDrawName(drawName: unknown): { success: true; data: string } | { success: false; error: string } {
  return validateRequest(drawNameSchema, drawName);
}
