import { z } from 'zod';
import { SLUG_REGEX, isReservedUsername } from '$lib/constants';

export const accountFormSchema = z.object({
  full_name: z.string().min(1, 'Display name is required'),
  username: z.string()
    .trim()
    .toLowerCase()
    .min(3, 'Username must be at least 3 characters long')
    .max(100, 'Username must be at most 100 characters long')
    .regex(
      SLUG_REGEX,
      'Username must be lowercase and can only include letters, numbers, and single dashes'
    )
    .refine((value) => !isReservedUsername(value), 'This username is reserved'),
});

export type AccountFormSchema = typeof accountFormSchema;
