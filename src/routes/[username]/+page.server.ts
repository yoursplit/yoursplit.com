import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPreviews } from '$lib/server/workout-routines';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .eq('username', params.username)
    .single();

  if (!userProfile) {
    error(404, 'Not Found');
  }

  const workoutRoutines = await getPreviews(supabase, { user_id: userProfile.id });
  const { count: numWorkoutRoutines } = await supabase
    .from('workout_routines')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userProfile.id);

  return {
    userProfile,
    workoutRoutines,
    numWorkoutRoutines: numWorkoutRoutines ?? 0,
  };
};
