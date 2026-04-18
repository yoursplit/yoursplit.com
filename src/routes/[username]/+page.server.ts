import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPreviews } from '$lib/server/workout-routines';

export const load: PageServerLoad = async ({ params, locals: { supabase, safeGetSession } }) => {
  const { session } = await safeGetSession();

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

  const [{ count: numFollowers }, { count: numFollowing }] = await Promise.all([
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userProfile.id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userProfile.id),
  ]);

  const isOwnProfile = Boolean(session && session.user.id === userProfile.id);
  let isFollowing = false;

  if (session && !isOwnProfile) {
    const { count: relationshipCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', session.user.id)
      .eq('following_id', userProfile.id);

    isFollowing = (relationshipCount ?? 0) > 0;
  }

  return {
    userProfile,
    workoutRoutines,
    numWorkoutRoutines: numWorkoutRoutines ?? 0,
    numFollowers: numFollowers ?? 0,
    numFollowing: numFollowing ?? 0,
    isOwnProfile,
    isFollowing,
    isLoggedIn: Boolean(session),
  };
};

export const actions: Actions = {
  follow: async ({ params, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session) {
      error(401, 'Unauthorized');
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', params.username)
      .single();

    if (!userProfile) {
      error(404, 'Not Found');
    }

    if (session.user.id === userProfile.id) {
      return;
    }

    const { count: existingRelationshipCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', session.user.id)
      .eq('following_id', userProfile.id);

    if ((existingRelationshipCount ?? 0) === 0) {
      const { error: insertFollowError } = await supabase
        .from('follows')
        .insert({
          follower_id: session.user.id,
          following_id: userProfile.id,
        });

      if (insertFollowError) {
        error(500, 'Unable to follow this account');
      }
    }
  },

  unfollow: async ({ params, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session) {
      error(401, 'Unauthorized');
    }

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', params.username)
      .single();

    if (!userProfile) {
      error(404, 'Not Found');
    }

    const { error: deleteFollowError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', session.user.id)
      .eq('following_id', userProfile.id);

    if (deleteFollowError) {
      error(500, 'Unable to unfollow this account');
    }
  },
};
