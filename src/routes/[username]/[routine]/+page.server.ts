import type { Actions, PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';

const YOUTUBE_URL_PATTERN = /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]{11}(?:[^\s"]*)?|youtu\.be\/[\w-]{11}(?:[^\s"]*)?)/i;

const extractYoutubeUrl = (text: string): string | null => {
  const match = text.match(YOUTUBE_URL_PATTERN);
  return match ? match[0] : null;
};

const isYoutubeUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    return hostname === 'youtube.com' || hostname === 'www.youtube.com' || hostname === 'youtu.be';
  } catch {
    return false;
  }
};

async function getRoutineIdByUsernameAndSlug(
  supabase: App.Locals['supabase'],
  username: string,
  slug: string,
): Promise<{ id: number }> {
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (!userProfile) {
    error(404, 'Not Found');
  }

  const { data: workoutRoutine } = await supabase
    .from('workout_routines')
    .select('id')
    .eq('user_id', userProfile.id)
    .eq('slug', slug)
    .single();

  if (!workoutRoutine) {
    error(404, 'Not Found');
  }

  return workoutRoutine;
}

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

  const { data: workoutRoutine } = await supabase
    .from('workout_routines')
    .select()
    .eq('user_id', userProfile.id)
    .eq('slug', params.routine)
    .single();

  if (!workoutRoutine) {
    error(404, 'Not Found');
  }

  const { count: favoritesCount } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('routine_id', workoutRoutine.id);

  let isFavorited = false;
  if (session) {
    const { count: favoriteCount } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id)
      .eq('routine_id', workoutRoutine.id);

    isFavorited = (favoriteCount ?? 0) > 0;
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
    workoutDaysData,
    favoritesCount: favoritesCount ?? 0,
    isFavorited,
    isLoggedIn: Boolean(session),
  };
};

export const actions: Actions = {
  searchDemoVideo: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const exerciseNameRaw = formData.get('exerciseName');
    const exerciseName = typeof exerciseNameRaw === 'string' ? exerciseNameRaw.trim() : '';
    const normalizedExerciseName = exerciseName.toLowerCase();

    if (!exerciseName) {
      return fail(400, {
        exerciseName,
        videoUrl: null,
        error: 'Exercise name is required.',
      });
    }

    const { data: cachedVideo } = await supabase
      .from('workout_exercise_videos')
      .select('video_url')
      .eq('exercise_name', normalizedExerciseName)
      .maybeSingle();

    if (cachedVideo?.video_url && isYoutubeUrl(cachedVideo.video_url)) {
      return {
        exerciseName,
        videoUrl: cachedVideo.video_url,
        error: null,
      };
    }

    try {
      const groq = new Groq({ apiKey: GROQ_API_KEY });
      const completion = await groq.chat.completions.create({
        model: 'groq/compound-mini',
        messages: [
          {
            role: 'user',
            content:
              `Find a YouTube exercise demonstration video for: ${exerciseName}. ` +
              'Return ONLY one line with either: (1) a full youtube.com or youtu.be URL for a valid exercise, or (2) ERROR if the input is not an exercise or no suitable video is found.',
          },
        ],
      });

      const rawContent = (completion.choices[0]?.message?.content ?? '').trim();
      const extractedVideoUrl = extractYoutubeUrl(rawContent);

      if (!extractedVideoUrl || !isYoutubeUrl(extractedVideoUrl)) {
        return fail(404, {
          exerciseName,
          videoUrl: null,
          error: 'video_not_found',
        });
      }

      const { error: insertVideoError } = await supabase
        .from('workout_exercise_videos')
        .upsert(
          {
            exercise_name: normalizedExerciseName,
            video_url: extractedVideoUrl,
          },
          { onConflict: 'exercise_name' },
        );

      if (insertVideoError) {
        console.error('Failed to cache workout exercise video URL', {
          exerciseName: normalizedExerciseName,
          error: insertVideoError.message,
        });
      }

      return {
        exerciseName,
        videoUrl: extractedVideoUrl,
        error: null,
      };
    } catch {
      return fail(500, {
        exerciseName,
        videoUrl: null,
        error: 'Could not search for a demo video right now. Please try again.',
      });
    }
  },

  favorite: async ({ params, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session) {
      error(401, 'Unauthorized');
    }

    const workoutRoutine = await getRoutineIdByUsernameAndSlug(supabase, params.username, params.routine);

    const { error: favoriteError } = await supabase
      .from('favorites')
      .upsert(
        {
          user_id: session.user.id,
          routine_id: workoutRoutine.id,
        },
        { onConflict: 'user_id,routine_id' },
      );

    if (favoriteError) {
      error(500, 'Unable to favorite this workout routine');
    }
  },

  unfavorite: async ({ params, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session) {
      error(401, 'Unauthorized');
    }

    const workoutRoutine = await getRoutineIdByUsernameAndSlug(supabase, params.username, params.routine);

    const { error: unfavoriteError } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', session.user.id)
      .eq('routine_id', workoutRoutine.id);

    if (unfavoriteError) {
      error(500, 'Unable to remove favorite from this workout routine');
    }
  },
};
