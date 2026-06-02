import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkoutRoutineCardProps, DayPreview } from '$lib/components/workout-card.svelte';
import type { WorkoutDifficulty, WorkoutType } from '$lib/constants';

type Filters = {
  user_id?: string;
  user_ids?: string[];
  workout_type?: WorkoutType;
  workout_difficulty?: WorkoutDifficulty;
  routine_ids?: string[];
  limit?: number;
  offset?: number;
  order_by?: 'recent' | 'favorites';
}

const applyPreviewFilters = <Query>(query: Query, filters?: Filters): Query => {
  let filteredQuery = query as any;

  if (filters?.user_id) {
    filteredQuery = filteredQuery.eq('user_id', filters.user_id);
  }

  if (filters?.user_ids) {
    filteredQuery = filteredQuery.in('user_id', filters.user_ids);
  }

  if (filters?.workout_type) {
    filteredQuery = filteredQuery.eq('workout_type', filters.workout_type);
  }

  if (filters?.workout_difficulty) {
    filteredQuery = filteredQuery.eq('workout_difficulty', filters.workout_difficulty);
  }

  if (filters?.routine_ids) {
    filteredQuery = filteredQuery.in('id', filters.routine_ids);
  }

  return filteredQuery as Query;
};

export async function getSearchMatchedRoutineIds(
  supabase: SupabaseClient,
  rawSearch: string,
): Promise<string[]> {
  const search = rawSearch.trim();
  if (!search) {
    return [];
  }

  const pattern = `%${search}%`;
  const quotedPattern = `"${pattern.replace(/[\\"]/g, '\\$&')}"`;
  const matchedRoutineIds = new Set<string>();

  const [{ data: routinesByName }, { data: profileMatches }, { data: exerciseMatches }] = await Promise.all([
    supabase.from('workout_routines').select('id').ilike('name', pattern),
    supabase.from('profiles').select('id').or(`username.ilike.${quotedPattern},full_name.ilike.${quotedPattern}`),
    supabase.from('workout_exercises').select('workout_day_id').ilike('name', pattern),
  ]);

  for (const routine of routinesByName ?? []) {
    matchedRoutineIds.add(routine.id);
  }

  const profileIds = (profileMatches ?? []).map((profile) => profile.id);
  if (profileIds.length > 0) {
    const { data: routinesByProfiles } = await supabase
      .from('workout_routines')
      .select('id')
      .in('user_id', profileIds);

    for (const routine of routinesByProfiles ?? []) {
      matchedRoutineIds.add(routine.id);
    }
  }

  const dayIds = [...new Set((exerciseMatches ?? []).map((exercise) => exercise.workout_day_id))];
  if (dayIds.length > 0) {
    const { data: daysData } = await supabase
      .from('workout_days')
      .select('workout_routine_id')
      .in('id', dayIds);

    for (const day of daysData ?? []) {
      matchedRoutineIds.add(day.workout_routine_id);
    }
  }

  return [...matchedRoutineIds];
}

export async function getPreviews(supabase: SupabaseClient, filters?: Filters): Promise<WorkoutRoutineCardProps[]> {
  const limit = filters?.limit ?? 20;
  const offset = filters?.offset ?? 0;
  const orderBy = filters?.order_by ?? 'recent';

  let workoutRoutinesData:
    | Array<{
        id: string;
        user_id: string;
        name: string;
        slug: string;
        uses_numbered_days: boolean;
        workout_type: WorkoutType;
        workout_difficulty: WorkoutDifficulty;
      }>
    | null = null;
  let pageFavoritesCountByRoutineId: Map<string, number> | null = null;

  if (orderBy === 'favorites') {
    const matchedIdsQuery = applyPreviewFilters(
      supabase.from('workout_routines').select('id'),
      filters,
    );
    const { data: matchedIdsData } = await matchedIdsQuery;
    const matchedIds = (matchedIdsData ?? []).map((row) => row.id as string);

    const favoritesCountByRoutineId = new Map<string, number>();
    if (matchedIds.length > 0) {
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('routine_id')
        .in('routine_id', matchedIds);

      for (const favorite of favoritesData ?? []) {
        const routineId = favorite.routine_id as string;
        favoritesCountByRoutineId.set(routineId, (favoritesCountByRoutineId.get(routineId) ?? 0) + 1);
      }
    }

    const sortedIds = [...matchedIds].sort((a, b) => {
      const countDiff = (favoritesCountByRoutineId.get(b) ?? 0) - (favoritesCountByRoutineId.get(a) ?? 0);
      if (countDiff !== 0) return countDiff;
      return a < b ? 1 : a > b ? -1 : 0;
    });

    const pageIds = sortedIds.slice(offset, offset + limit);

    if (pageIds.length === 0) {
      return [];
    }

    const { data: pageData } = await supabase
      .from('workout_routines')
      .select('id, user_id, name, slug, uses_numbered_days, workout_type, workout_difficulty')
      .in('id', pageIds);

    const pageById = new Map((pageData ?? []).map((row) => [row.id as string, row]));
    workoutRoutinesData = pageIds
      .map((id) => pageById.get(id))
      .filter((row): row is NonNullable<typeof row> => row != null);

    pageFavoritesCountByRoutineId = new Map(
      pageIds.map((id) => [id, favoritesCountByRoutineId.get(id) ?? 0]),
    );
  } else {
    const workoutRoutinesQuery = applyPreviewFilters(supabase
      .from('workout_routines')
      .select('id, user_id, name, slug, uses_numbered_days, workout_type, workout_difficulty')
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1), filters);

    const { data } = await workoutRoutinesQuery;
    workoutRoutinesData = data;
  }

  if (!workoutRoutinesData) {
    return [];
  }

  const routineIds = workoutRoutinesData.map((routine) => routine.id);
  const userIds = [...new Set(workoutRoutinesData.map((routine) => routine.user_id))];

  const [{ data: profilesData }, { data: workoutDaysData }] = await Promise.all([
    supabase.from('profiles').select('id, username').in('id', userIds),
    supabase
      .from('workout_days')
      .select('id, workout_routine_id, day_number, day_focus')
      .in('workout_routine_id', routineIds)
      .order('day_number', { ascending: true }),
  ]);

  const profileById = new Map((profilesData ?? []).map((profile) => [profile.id, profile.username]));

  const dayIds = (workoutDaysData ?? []).map((day) => day.id);
  const exerciseCountByDayId = new Map<string, number>();
  const favoritesCountByRoutineId = pageFavoritesCountByRoutineId ?? new Map<string, number>();

  if (dayIds.length > 0) {
    const { data: workoutExercisesData } = await supabase
      .from('workout_exercises')
      .select('workout_day_id')
      .in('workout_day_id', dayIds);

    for (const exercise of workoutExercisesData ?? []) {
      const dayId = exercise.workout_day_id;
      exerciseCountByDayId.set(dayId, (exerciseCountByDayId.get(dayId) ?? 0) + 1);
    }
  }

  if (pageFavoritesCountByRoutineId === null && routineIds.length > 0) {
    const { data: favoritesData } = await supabase
      .from('favorites')
      .select('routine_id')
      .in('routine_id', routineIds);

    for (const favorite of favoritesData ?? []) {
      const routineId = favorite.routine_id;
      favoritesCountByRoutineId.set(routineId, (favoritesCountByRoutineId.get(routineId) ?? 0) + 1);
    }
  }

  const daysByRoutineId = new Map<string, Array<{ id: string; dayNumber: number; dayLabel?: string }>>();

  for (const day of workoutDaysData ?? []) {
    const routineDays = daysByRoutineId.get(day.workout_routine_id) ?? [];
    routineDays.push({
      id: day.id,
      dayNumber: day.day_number,
      dayLabel: day.day_focus,
    });
    daysByRoutineId.set(day.workout_routine_id, routineDays);
  }

  return workoutRoutinesData.map((routine) => {
    const daysWithNumber = daysByRoutineId.get(routine.id) ?? [];
    daysWithNumber.sort((a, b) => a.dayNumber - b.dayNumber);

    const daysPreview: DayPreview[] = daysWithNumber.map((day) => {
      const numExercises = exerciseCountByDayId.get(day.id) ?? 0;
      return {
        dayLabel: day.dayLabel,
        numExercises,
      };
    });

    const totalExercises = daysPreview.reduce((sum, day) => sum + day.numExercises, 0);
    const username = profileById.get(routine.user_id) ?? 'unknown';

    return {
      name: routine.name,
      username,
      href: `/${username}/${routine.slug}`,
      usesNumberedDays: routine.uses_numbered_days,
      workoutType: routine.workout_type,
      workoutDifficulty: routine.workout_difficulty,
      daysPreview,
      totalExercises,
      favoritesCount: favoritesCountByRoutineId.get(routine.id) ?? 0,
    };
  });
}

export async function countPreviews(supabase: SupabaseClient, filters?: Filters): Promise<number> {
  const workoutRoutinesCountQuery = applyPreviewFilters(supabase
    .from('workout_routines')
    .select('id', { count: 'exact', head: true }), filters);

  const { count } = await workoutRoutinesCountQuery;

  return count ?? 0;
}
