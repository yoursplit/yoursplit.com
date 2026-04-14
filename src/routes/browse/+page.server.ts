import type { PageServerLoad } from './$types';
import { getPreviews } from '$lib/server/workout-routines';

const PAGE_SIZE = 12;
const WORKOUT_TYPES = ['strength', 'cardio', 'flexibility', 'calisthenics'] as const;
const WORKOUT_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
  const pageParam = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const offset = (page - 1) * PAGE_SIZE;

  const workoutTypeParam = url.searchParams.get('type');
  const workoutDifficultyParam = url.searchParams.get('difficulty');

  const workoutType = workoutTypeParam && WORKOUT_TYPES.includes(workoutTypeParam as (typeof WORKOUT_TYPES)[number])
    ? workoutTypeParam
    : null;
  const workoutDifficulty = workoutDifficultyParam && WORKOUT_DIFFICULTIES.includes(workoutDifficultyParam as (typeof WORKOUT_DIFFICULTIES)[number])
    ? workoutDifficultyParam
    : null;

  let workoutRoutinesCountQuery = supabase
    .from('workout_routines')
    .select('id', { count: 'exact', head: true });

  if (workoutType) {
    workoutRoutinesCountQuery = workoutRoutinesCountQuery.eq('workout_type', workoutType);
  }

  if (workoutDifficulty) {
    workoutRoutinesCountQuery = workoutRoutinesCountQuery.eq('workout_difficulty', workoutDifficulty);
  }

  const [{ count: totalWorkoutRoutines }, workoutRoutinesWithProbe] = await Promise.all([
    workoutRoutinesCountQuery,
    getPreviews(supabase, {
      workout_type: workoutType ?? undefined,
      workout_difficulty: workoutDifficulty ?? undefined,
      limit: PAGE_SIZE + 1,
      offset,
    }),
  ]);

  const hasNextPage = workoutRoutinesWithProbe.length > PAGE_SIZE;
  const workoutRoutines = hasNextPage
    ? workoutRoutinesWithProbe.slice(0, PAGE_SIZE)
    : workoutRoutinesWithProbe;

  return {
    workoutRoutines,
    page,
    pageSize: PAGE_SIZE,
    totalWorkoutRoutines: totalWorkoutRoutines ?? 0,
    workoutType,
    workoutDifficulty,
    hasNextPage,
    hasPreviousPage: page > 1,
  };
};
