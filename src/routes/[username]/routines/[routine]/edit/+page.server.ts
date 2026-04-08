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

  const initialWorkoutFormData = {
    name: workoutRoutineData.name,
    slug: workoutRoutineData.slug,
    workout_days: [
      {
        workout_exercises: [],
      },
    ],
  };

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

    const { data: upsertRoutineData, error: upsertRoutineError } = await supabase.from('workout_routines').upsert({
      updated_at: new Date(),
      name: workoutForm.data.name,
      slug: workoutForm.data.slug,
      description: workoutForm.data.description,
    }).select('id').single();
    if (upsertRoutineError) {
      console.log('Upsert routine error:');
      console.log(upsertRoutineError);
      error(500);
    }
    const { data: insertDaysData, error: insertDaysError } = await supabase.from('workout_days').insert(
      workoutForm.data.workout_days.map((day, index) => ({
        workout_routine_id: upsertRoutineData.id,
        day_number: index + 1,
      }))
    ).select('id');
    if (insertDaysError) {
      console.log('Insert days error:');
      console.log(insertDaysError);
      error(500);
    }
    for (let i = 0; i < workoutForm.data.workout_days.length; i++) {
      const { error: insertExercisesError } = await supabase.from('workout_exercises').insert(
        workoutForm.data.workout_days[i].workout_exercises.map((exercise) => ({
          workout_day_id: insertDaysData[i].id,
          name: exercise.name,
          weight: exercise.weight,
          sets: exercise.sets,
          reps: exercise.reps,
        }))
      );
      if (insertExercisesError) {
        console.log('Insert exercises error:');
        console.log(insertExercisesError);
        error(500);
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
