import { z } from 'zod';

const workoutTypeValues = ['strength', 'cardio', 'flexibility', 'calisthenics'] as const;
const workoutDifficultyValues = ['beginner', 'intermediate', 'advanced'] as const;

export const workoutFormSchema = z.object({
  id: z.optional(z.int()),
  name: z.string().min(3, 'Name must be at least 3 characters long').max(100, 'Name must be at most 100 characters long'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters long')
    .max(100, 'Slug must be at most 100 characters long')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase and can only include letters, numbers, and single dashes'
    ),
  description: z.optional(z.string().max(1000, 'Description must be at most 1000 characters long')),
  workout_type: z.enum(workoutTypeValues),
  workout_difficulty: z.enum(workoutDifficultyValues),
  uses_numbered_days: z.boolean(),
  deleted_day_ids: z.array(z.int()).default([]),
  workout_days: z.array(
    z.object({
      id: z.optional(z.int()),
      day_focus: z.optional(z.string().max(100, 'Daily focus must be at most 100 characters long')),
      notes: z.optional(z.string().max(500, 'Notes must be at most 500 characters long')),
      marked_for_deletion: z.boolean().default(false),
      workout_exercises: z.array(
        z.object({
          id: z.optional(z.int()),
          name: z.string().min(3, 'Exercise name must be at least 3 characters long').max(100, 'Exercise name must be at most 100 characters long'),
          weight: z.optional(z.number().min(0, 'Weight must be a positive number')),
          sets: z.number().min(1, 'Sets must be at least 1'),
          reps: z.number().min(1, 'Reps must be at least 1'),
          notes: z.optional(z.string().max(500, 'Notes must be at most 500 characters long')),
        })
      )
    })
  )
});

export type WorkoutFormSchema = typeof workoutFormSchema;
