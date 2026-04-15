import type { PageServerLoad } from './$types';
import { getPreviews, getSearchMatchedRoutineIds } from '$lib/server/workout-routines';

const PAGE_SIZE = 12;
const WORKOUT_TYPES = ['strength', 'cardio', 'flexibility', 'calisthenics', 'other'] as const;
const WORKOUT_DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'other'] as const;

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
  const pageParam = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const offset = (page - 1) * PAGE_SIZE;

  const workoutTypeParam = url.searchParams.get('type');
  const workoutDifficultyParam = url.searchParams.get('difficulty');
  const searchParam = url.searchParams.get('search')?.trim() ?? '';
  const search = searchParam.length > 0 ? searchParam : null;

  const workoutType = workoutTypeParam && WORKOUT_TYPES.includes(workoutTypeParam as (typeof WORKOUT_TYPES)[number])
    ? workoutTypeParam
    : null;
  const workoutDifficulty = workoutDifficultyParam && WORKOUT_DIFFICULTIES.includes(workoutDifficultyParam as (typeof WORKOUT_DIFFICULTIES)[number])
    ? workoutDifficultyParam
    : null;

  const searchMatchedRoutineIds = search
    ? await getSearchMatchedRoutineIds(supabase, search)
    : null;

  if (searchMatchedRoutineIds?.length === 0) {
    return {
      workoutRoutines: [],
      page,
      pageSize: PAGE_SIZE,
      totalWorkoutRoutines: 0,
      workoutType,
      workoutDifficulty,
      search,
      hasNextPage: false,
      hasPreviousPage: page > 1,
    };
  }

  let workoutRoutinesCountQuery = supabase
    .from('workout_routines')
    .select('id', { count: 'exact', head: true });

  if (workoutType) {
    workoutRoutinesCountQuery = workoutRoutinesCountQuery.eq('workout_type', workoutType);
  }

  if (workoutDifficulty) {
    workoutRoutinesCountQuery = workoutRoutinesCountQuery.eq('workout_difficulty', workoutDifficulty);
  }

  if (searchMatchedRoutineIds && searchMatchedRoutineIds.length > 0) {
    workoutRoutinesCountQuery = workoutRoutinesCountQuery.in('id', searchMatchedRoutineIds);
  }

  const [{ count: totalWorkoutRoutines }, workoutRoutinesWithProbe] = await Promise.all([
    workoutRoutinesCountQuery,
    getPreviews(supabase, {
      workout_type: workoutType ?? undefined,
      workout_difficulty: workoutDifficulty ?? undefined,
      routine_ids: searchMatchedRoutineIds ?? undefined,
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
    search,
    hasNextPage,
    hasPreviousPage: page > 1,
  };
};
