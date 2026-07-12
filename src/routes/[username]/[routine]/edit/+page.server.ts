import type { PageServerLoad, Actions } from './$types';
import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod4 } from "sveltekit-superforms/adapters";
import { workoutFormSchema } from './workout-form-schema';

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
  const { session } = await safeGetSession();
  if (!session) {
    redirect(303, '/login');
  }

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', params.username)
    .single();
  if (!userProfile || userProfile.id !== session.user.id) {
    error(404, 'Not Found');
  }

  const { data: workoutRoutineData } = await supabase
    .from('workout_routines')
    .select(`
      id, name, slug, description, uses_numbered_days, workout_type, workout_difficulty,
      workout_days (
        id, day_number, day_focus, notes,
        workout_exercises (
          id, name, weight, sets, reps, notes
        )
      )
    `)
    .eq('user_id', userProfile.id)
    .eq('slug', params.routine)
    .single();
  if (!workoutRoutineData) {
    error(404, 'Not Found');
  }

  const sortedWorkoutDays = (workoutRoutineData.workout_days ?? []).sort((a, b) => a.day_number - b.day_number);

  const workoutDaysWithExercises = [];
  for (const day of sortedWorkoutDays) {
    const sortedExercises = (day.workout_exercises ?? []).sort((a, b) => a.id - b.id);

    workoutDaysWithExercises.push({
      id: day.id,
      day_focus: day.day_focus ?? undefined,
      notes: day.notes ?? undefined,
      marked_for_deletion: false,
      workout_exercises: sortedExercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        weight: exercise.weight ?? undefined,
        sets: exercise.sets ?? 0,
        reps: exercise.reps ?? 0,
        notes: exercise.notes ?? undefined,
      })),
    });
  }

  const initialWorkoutFormData = {
    id: workoutRoutineData.id,
    name: workoutRoutineData.name,
    slug: workoutRoutineData.slug,
    description: workoutRoutineData.description ?? undefined,
    workout_type: workoutRoutineData.workout_type ?? 'other',
    workout_difficulty: workoutRoutineData.workout_difficulty ?? 'other',
    uses_numbered_days: workoutRoutineData.uses_numbered_days,
    deleted_day_ids: [],
    workout_days: [
      ...workoutDaysWithExercises,
    ],
  };

  if (initialWorkoutFormData.workout_days.length === 0) {
    initialWorkoutFormData.workout_days.push({
      id: undefined,
      day_focus: undefined,
      notes: undefined,
      marked_for_deletion: false,
      workout_exercises: [],
    } as any);
  }

  return {
    workoutForm: await superValidate(initialWorkoutFormData, zod4(workoutFormSchema)),
    session,
  };
};

export const actions: Actions = {
  save: async (event) => {
    const workoutForm = await superValidate(event, zod4(workoutFormSchema));
    if (!workoutForm.valid) {
      return fail(400, {
        workoutForm,
      });
    }

    const { locals: { supabase, safeGetSession } } = event;
    const { session } = await safeGetSession();
    if (!session) {
      error(500);
    }

    const { data: existingRoutineData, error: existingRoutineError } = await supabase
      .from('workout_routines')
      .select('id, slug')
      .eq('id', workoutForm.data.id as number)
      .eq('user_id', session.user.id)
      .single();
    if (existingRoutineError || !existingRoutineData) {
      error(404, 'Not Found');
    }

    if (workoutForm.data.slug !== existingRoutineData.slug) {
      const { data: conflictingRoutine, error: conflictingRoutineError } = await supabase
        .from('workout_routines')
        .select('id')
        .eq('slug', workoutForm.data.slug)
        .neq('id', existingRoutineData.id)
        .limit(1)
        .maybeSingle();

      if (conflictingRoutineError) {
        console.log('Slug conflict check error:');
        console.log(conflictingRoutineError);
        error(500);
      }

      if (conflictingRoutine) {
        return setError(workoutForm, 'slug', 'Slug is already taken');
      }
    }

    const { data: existingDaysData, error: existingDaysError } = await supabase
      .from('workout_days')
      .select('id, day_number')
      .eq('workout_routine_id', existingRoutineData.id)
      .order('id', { ascending: true });
    if (existingDaysError) {
      console.log('Fetch days error:');
      console.log(existingDaysError);
      error(500);
    }

    const existingDayIds = new Set((existingDaysData ?? []).map((day) => day.id));
    const existingDayIdByNumber = new Map<number, number>();
    for (const day of existingDaysData ?? []) {
      if (!existingDayIdByNumber.has(day.day_number)) {
        existingDayIdByNumber.set(day.day_number, day.id);
      }
    }

    const dayIdsMarkedForDeletion = [
      ...new Set([
        ...workoutForm.data.deleted_day_ids.filter((id) => existingDayIds.has(id)),
        ...workoutForm.data.workout_days
          .filter((day) => day.marked_for_deletion && !!day.id && existingDayIds.has(day.id))
          .map((day) => day.id as number),
      ]),
    ];

    if (dayIdsMarkedForDeletion.length > 0) {
      const { error: deleteMarkedExercisesError } = await supabase
        .from('workout_exercises')
        .delete()
        .in('workout_day_id', dayIdsMarkedForDeletion);
      if (deleteMarkedExercisesError) {
        console.log('Delete marked exercises error:');
        console.log(deleteMarkedExercisesError);
        error(500);
      }

      const { error: deleteMarkedDaysError } = await supabase
        .from('workout_days')
        .delete()
        .in('id', dayIdsMarkedForDeletion)
        .eq('workout_routine_id', existingRoutineData.id);
      if (deleteMarkedDaysError) {
        console.log('Delete marked days error:');
        console.log(deleteMarkedDaysError);
        error(500);
      }
    }

    const submittedDaysToKeep = workoutForm.data.workout_days.filter((day) => !day.marked_for_deletion);

    const daysToUpsert: any[] = [];

    for (let i = 0; i < submittedDaysToKeep.length; i++) {
        const submittedDay = submittedDaysToKeep[i];
        const dayNumber = i + 1;
        let id: number | undefined;

        if (submittedDay.id && existingDayIds.has(submittedDay.id)) {
            id = submittedDay.id;
        } else if (existingDayIdByNumber.has(dayNumber)) {
            id = existingDayIdByNumber.get(dayNumber) as number;
        }

        daysToUpsert.push({
            ...(id ? { id } : {}),
            workout_routine_id: existingRoutineData.id,
            day_number: dayNumber,
            day_focus: submittedDay.day_focus,
            notes: submittedDay.notes,
        });
    }

    const savedDayIdMap = new Map<number, number>();
    if (daysToUpsert.length > 0) {
        const { data: upsertedDays, error: upsertDaysError } = await supabase
            .from('workout_days')
            .upsert(daysToUpsert, { onConflict: 'id' })
            .select('id, day_number');

        if (upsertDaysError || !upsertedDays) {
            console.log('Upsert days error:');
            console.log(upsertDaysError);
            error(500);
        }

        for (const d of upsertedDays) {
            savedDayIdMap.set(d.day_number, d.id);
        }
    }

    const savedDayIds = Array.from(savedDayIdMap.values());
    const { data: allExistingExercisesData, error: allExistingExercisesError } = await supabase
        .from('workout_exercises')
        .select('id, workout_day_id')
        .in('workout_day_id', savedDayIds.length > 0 ? savedDayIds : [-1]);

    if (allExistingExercisesError) {
        console.log('Fetch all exercises error:');
        console.log(allExistingExercisesError);
        error(500);
    }

    const existingExerciseIds = new Set((allExistingExercisesData ?? []).map((exercise) => exercise.id));
    const exercisesToUpsert: any[] = [];
    const submittedExistingExerciseIds = new Set<number>();

    for (let i = 0; i < submittedDaysToKeep.length; i++) {
        const submittedDay = submittedDaysToKeep[i];
        const dayNumber = i + 1;
        const savedDayId = savedDayIdMap.get(dayNumber);

        if (!savedDayId) continue;

        for (const submittedExercise of submittedDay.workout_exercises) {
            let id: number | undefined;

            if (submittedExercise.id && existingExerciseIds.has(submittedExercise.id)) {
                id = submittedExercise.id;
                submittedExistingExerciseIds.add(id);
            }

            exercisesToUpsert.push({
                ...(id ? { id } : {}),
                workout_day_id: savedDayId,
                name: submittedExercise.name,
                weight: submittedExercise.weight ?? null,
                sets: submittedExercise.sets,
                reps: submittedExercise.reps,
                notes: submittedExercise.notes,
            });
        }
    }

    if (exercisesToUpsert.length > 0) {
        const { error: upsertExercisesError } = await supabase
            .from('workout_exercises')
            .upsert(exercisesToUpsert, { onConflict: 'id' });
        if (upsertExercisesError) {
            console.log('Upsert exercises error:');
            console.log(upsertExercisesError);
            error(500);
        }
    }

    const exerciseIdsToDelete = (allExistingExercisesData ?? [])
        .map((exercise) => exercise.id)
        .filter((id) => !submittedExistingExerciseIds.has(id));

    if (exerciseIdsToDelete.length > 0) {
        const { error: deleteExercisesError } = await supabase
            .from('workout_exercises')
            .delete()
            .in('id', exerciseIdsToDelete);
        if (deleteExercisesError) {
            console.log('Delete exercises error:');
            console.log(deleteExercisesError);
            error(500);
        }
    }

    const { data: daysAfterSaveData, error: daysAfterSaveError } = await supabase
      .from('workout_days')
      .select('id, day_number')
      .eq('workout_routine_id', existingRoutineData.id)
      .order('id', { ascending: true });
    if (daysAfterSaveError) {
      console.log('Fetch days after save error:');
      console.log(daysAfterSaveError);
      error(500);
    }

    const dayIdsToDelete: number[] = [];
    const duplicateDayIdsByKeepId = new Map<number, number[]>();
    const keepDayIdByNumber = new Map<number, number>();

    for (const day of daysAfterSaveData ?? []) {
      const keepId = keepDayIdByNumber.get(day.day_number);
      if (!keepId) {
        keepDayIdByNumber.set(day.day_number, day.id);
        continue;
      }

      dayIdsToDelete.push(day.id);
      const duplicates = duplicateDayIdsByKeepId.get(keepId) ?? [];
      duplicates.push(day.id);
      duplicateDayIdsByKeepId.set(keepId, duplicates);
    }

    for (const [keepId, duplicateIds] of duplicateDayIdsByKeepId.entries()) {
      const { error: moveExercisesError } = await supabase
        .from('workout_exercises')
        .update({
          workout_day_id: keepId,
        })
        .in('workout_day_id', duplicateIds);

      if (moveExercisesError) {
        console.log('Move duplicate day exercises error:');
        console.log(moveExercisesError);
        error(500);
      }
    }

    if (dayIdsToDelete.length > 0) {
      const { error: deleteDuplicateDaysError } = await supabase
        .from('workout_days')
        .delete()
        .in('id', dayIdsToDelete)
        .eq('workout_routine_id', existingRoutineData.id);

      if (deleteDuplicateDaysError) {
        console.log('Delete duplicate days error:');
        console.log(deleteDuplicateDaysError);
        error(500);
      }
    }

    const { error: updateRoutineError } = await supabase
      .from('workout_routines')
      .update({
        updated_at: new Date().toISOString(),
        name: workoutForm.data.name,
        slug: workoutForm.data.slug,
        description: workoutForm.data.description,
        workout_type: workoutForm.data.workout_type,
        workout_difficulty: workoutForm.data.workout_difficulty,
        uses_numbered_days: workoutForm.data.uses_numbered_days,
      })
      .eq('id', existingRoutineData.id)
      .eq('user_id', session.user.id);
    if (updateRoutineError) {
      if (updateRoutineError.code === '23505') {
        return setError(workoutForm, 'slug', 'Slug is already taken');
      }
      console.log('Update routine error:');
      console.log(updateRoutineError);
      error(500);
    }

    // const { error: updateError } = await supabase.from('profiles').upsert({
    //   id: session.user.id,
    //   full_name: workoutForm.data.full_name,
    //   username: workoutForm.data.username,
    //   updated_at: new Date(),
    // });

    // if (updateError) {
    //   if (updateError.code === '23505') {
    //     return setError(workoutForm, 'username', 'Username is already taken');
    //   }
    //   error(500);
    // }

    if (workoutForm.data.slug !== event.params.routine) {
      redirect(303, `/${event.params.username}/${encodeURIComponent(workoutForm.data.slug)}/edit`);
    }

    return {
      workoutForm,
    };
  },
  delete: async ({ params, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session) {
      redirect(303, '/login');
    }

    // Days, exercises, and favorites are removed automatically via
    // ON DELETE CASCADE, so deleting the routine row is sufficient. The
    // .select() lets us detect a missing/not-owned routine (0 rows) as a 404.
    const { data: deletedRoutines, error: deleteRoutineError } = await supabase
      .from('workout_routines')
      .delete()
      .eq('slug', params.routine)
      .eq('user_id', session.user.id)
      .select('id');
    if (deleteRoutineError) {
      console.error('Delete routine error:', deleteRoutineError);
      error(500);
    }
    if (!deletedRoutines || deletedRoutines.length === 0) {
      error(404, 'Not Found');
    }

    redirect(303, `/${params.username}`);
  },
};
