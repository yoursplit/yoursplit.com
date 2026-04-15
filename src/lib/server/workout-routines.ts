import type { SupabaseClient } from "@supabase/supabase-js";
import type { WorkoutRoutineCardProps, DayPreview } from '$lib/components/workout-card.svelte';

type Filters = {
  user_id?: string;
  workout_type?: string;
  workout_difficulty?: string;
  routine_ids?: string[];
  limit?: number;
  offset?: number;
}

export async function getSearchMatchedRoutineIds(
  supabase: SupabaseClient,
  rawSearch: string,
): Promise<string[]> {
  const search = rawSearch.trim();
  if (!search) {
    return [];
  }

  const pattern = `%${search}%`;
  const matchedRoutineIds = new Set<string>();

  const [{ data: routinesByName }, { data: profileMatches }, { data: exerciseMatches }] = await Promise.all([
    supabase.from('workout_routines').select('id').ilike('name', pattern),
    supabase.from('profiles').select('id').or(`username.ilike.${pattern},full_name.ilike.${pattern}`),
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

  let workoutRoutinesQuery = supabase
    .from('workout_routines')
    .select('id, user_id, name, slug, uses_numbered_days, workout_type, workout_difficulty')
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters?.user_id) {
    workoutRoutinesQuery = workoutRoutinesQuery.eq('user_id', filters.user_id);
  }

  if (filters?.workout_type) {
    workoutRoutinesQuery = workoutRoutinesQuery.eq('workout_type', filters.workout_type);
  }

  if (filters?.workout_difficulty) {
    workoutRoutinesQuery = workoutRoutinesQuery.eq('workout_difficulty', filters.workout_difficulty);
  }

  if (filters?.routine_ids) {
    workoutRoutinesQuery = workoutRoutinesQuery.in('id', filters.routine_ids);
  }

  const { data: workoutRoutinesData } = await workoutRoutinesQuery;

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
    };
  });
}
