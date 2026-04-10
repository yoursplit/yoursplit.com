import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .eq('username', params.username)
    .single();

  if (!userProfile) {
    error(404, 'Not Found');
  }

  const { data: workoutRoutine } = await supabase
    .from('workout_routines')
    .select()
    .eq('user_id', userProfile.id)
    .eq('slug', params.routine)
    .single();

  if (!workoutRoutine) {
    error(404, 'Not Found');
  }

  const { data: workoutDaysData } = await supabase
    .from('workout_days')
    .select(`
      id, 
      day_number, 
      day_focus, 
      notes,
      workout_exercises (
        id,
        name,
        sets,
        reps,
        weight,
        notes
      )
    `)
    .eq('workout_routine_id', workoutRoutine.id)
    .order('day_number', { ascending: true });

  return {
    userProfile,
    workoutRoutine,
    workoutDaysData
  };
};
