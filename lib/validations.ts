import { z } from 'zod';

// Schedule schemas
export const createScheduleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  targetTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM format'),
  daysOfWeek: z.array(
    z.number().int().min(1).max(7)
  ).min(1, 'Select at least one day'),
  assetIds: z.array(z.string()).optional().default([]),
});

export const updateScheduleSchema = createScheduleSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// User schemas
export const updateUserSchema = z.object({
  telegramChatId: z.string().optional(),
  timezone: z.string().optional(),
});

// Asset schemas
export const createAssetSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  name: z.string().min(1, 'Name is required'),
  assetType: z.enum(['STOCK', 'CRYPTO', 'COMMODITY', 'INDEX']),
  exchange: z.string().min(1, 'Exchange is required'),
});

// Clerk webhook schema
export const clerkWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string(),
    email_addresses: z.array(z.object({
      id: z.string(),
      email_address: z.string(),
    })).optional(),
    primary_email_address_id: z.string().optional(),
  }),
});

// Type exports
type ScheduleUpdateInput = z.infer<typeof updateScheduleSchema>;
export type { ScheduleUpdateInput };
