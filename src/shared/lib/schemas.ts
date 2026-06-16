import { z } from 'zod';

export const balanceTypeSchema = z.enum(['vacation', 'sick']);

export const balanceCellSchema = z.object({
  employeeId: z.string(),
  locationId: z.string(),
  locationName: z.string(),
  balanceType: balanceTypeSchema,
  availableDays: z.number().min(0),
  asOf: z.string(),
});

export const createTimeOffRequestSchema = z.object({
  employeeId: z.string().min(1),
  locationId: z.string().min(1),
  balanceType: balanceTypeSchema,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  daysRequested: z.number().min(0.5),
  note: z.string().optional(),
});

export const patchTimeOffRequestSchema = z.object({
  action: z.enum(['approve', 'deny']),
  managerId: z.string().min(1),
  balanceSnapshotDays: z.number().optional(),
});

export const chaosTriggerSchema = z.object({
  action: z.enum([
    'anniversary_bonus',
    'silent_wrong_next',
    'slow_network',
    'reset',
    'year_start_refresh',
  ]),
  employeeId: z.string().optional(),
  locationId: z.string().optional(),
  bonusDays: z.number().optional(),
  delayMs: z.number().optional(),
});

export type CreateTimeOffRequestInput = z.infer<typeof createTimeOffRequestSchema>;
