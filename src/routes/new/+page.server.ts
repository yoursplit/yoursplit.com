import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession();
  if (!session) {
    redirect(303, '/login');
  }

  return {};
};

export const actions: Actions = {
  create: async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session) {
      redirect(303, '/login');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();

    if (!profile?.username) {
      error(500, 'Profile is missing a username');
    }

    const slug = crypto.randomUUID();

    const { error: insertRoutineError } = await supabase
      .from('workout_routines')
      .insert({
        user_id: session.user.id,
        name: 'My Workout Routine',
        slug,
        uses_numbered_days: true,
      });

    if (insertRoutineError) {
      console.log('Create routine error:');
      console.log(insertRoutineError);
      error(500, 'Unable to create workout routine');
    }

    redirect(303, `/${profile.username}/${slug}/edit`);
  },
};
