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
    .select('id, name, slug, description, uses_numbered_days')
    .eq('user_id', userProfile.id)
    .eq('slug', params.routine)
    .single();
  if (!workoutRoutineData) {
    error(404, 'Not Found');
  }

  const { data: workoutDaysData } = await supabase
    .from('workout_days')
    .select('id, day_number, day_label, notes')
    .eq('workout_routine_id', workoutRoutineData.id)
    .order('day_number', { ascending: true });

  const workoutDaysWithExercises = [];
  for (const day of workoutDaysData ?? []) {
    const { data: workoutExercisesData } = await supabase
      .from('workout_exercises')
      .select('id, name, weight, sets, reps, notes')
      .eq('workout_day_id', day.id)
      .order('id', { ascending: true });

    workoutDaysWithExercises.push({
      id: day.id,
      notes: day.notes ?? undefined,
      workout_exercises: (workoutExercisesData ?? []).map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        weight: exercise.weight ?? undefined,
        sets: exercise.sets,
        reps: exercise.reps,
        notes: exercise.notes ?? undefined,
      })),
    });
  }

  const initialWorkoutFormData = {
    id: workoutRoutineData.id,
    name: workoutRoutineData.name,
    slug: workoutRoutineData.slug,
    description: workoutRoutineData.description ?? undefined,
    workout_days: [
      ...workoutDaysWithExercises,
    ],
  };

  if (initialWorkoutFormData.workout_days.length === 0) {
    initialWorkoutFormData.workout_days.push({
      id: undefined,
      notes: undefined,
      workout_exercises: [],
    });
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
      .select('id')
      .eq('id', workoutForm.data.id)
      .eq('user_id', session.user.id)
      .single();
    if (existingRoutineError || !existingRoutineData) {
      error(404, 'Not Found');
    }

    const { error: updateRoutineError } = await supabase
      .from('workout_routines')
      .update({
        updated_at: new Date(),
        name: workoutForm.data.name,
        slug: workoutForm.data.slug,
        description: workoutForm.data.description,
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

    const { data: existingDaysData, error: existingDaysError } = await supabase
      .from('workout_days')
      .select('id')
      .eq('workout_routine_id', existingRoutineData.id);
    if (existingDaysError) {
      console.log('Fetch days error:');
      console.log(existingDaysError);
      error(500);
    }

    const existingDayIds = new Set((existingDaysData ?? []).map((day) => day.id));

    for (let i = 0; i < workoutForm.data.workout_days.length; i++) {
      const submittedDay = workoutForm.data.workout_days[i];
      const dayNumber = i + 1;
      let savedDayId: number;

      if (submittedDay.id && existingDayIds.has(submittedDay.id)) {
        const { error: updateDayError } = await supabase
          .from('workout_days')
          .update({
            day_number: dayNumber,
            notes: submittedDay.notes,
          })
          .eq('id', submittedDay.id)
          .eq('workout_routine_id', existingRoutineData.id);
        if (updateDayError) {
          console.log('Update day error:');
          console.log(updateDayError);
          error(500);
        }
        savedDayId = submittedDay.id;
      } else {
        const { data: insertedDay, error: insertDayError } = await supabase
          .from('workout_days')
          .insert({
            workout_routine_id: existingRoutineData.id,
            day_number: dayNumber,
            notes: submittedDay.notes,
          })
          .select('id')
          .single();
        if (insertDayError || !insertedDay) {
          console.log('Insert day error:');
          console.log(insertDayError);
          error(500);
        }
        savedDayId = insertedDay.id;
      }

      const { data: existingExercisesData, error: existingExercisesError } = await supabase
        .from('workout_exercises')
        .select('id')
        .eq('workout_day_id', savedDayId);
      if (existingExercisesError) {
        console.log('Fetch exercises error:');
        console.log(existingExercisesError);
        error(500);
      }

      const existingExerciseIds = new Set((existingExercisesData ?? []).map((exercise) => exercise.id));

      for (const submittedExercise of submittedDay.workout_exercises) {
        if (submittedExercise.id && existingExerciseIds.has(submittedExercise.id)) {
          const { error: updateExerciseError } = await supabase
            .from('workout_exercises')
            .update({
              name: submittedExercise.name,
              weight: submittedExercise.weight,
              sets: submittedExercise.sets,
              reps: submittedExercise.reps,
              notes: submittedExercise.notes,
            })
            .eq('id', submittedExercise.id)
            .eq('workout_day_id', savedDayId);
          if (updateExerciseError) {
            console.log('Update exercise error:');
            console.log(updateExerciseError);
            error(500);
          }
        } else {
          const { error: insertExerciseError } = await supabase
            .from('workout_exercises')
            .insert({
              workout_day_id: savedDayId,
              name: submittedExercise.name,
              weight: submittedExercise.weight,
              sets: submittedExercise.sets,
              reps: submittedExercise.reps,
              notes: submittedExercise.notes,
            });
          if (insertExerciseError) {
            console.log('Insert exercise error:');
            console.log(insertExerciseError);
            error(500);
          }
        }
      }
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

    console.log(workoutForm.data);

    return {
      workoutForm,
    };
  },
};
