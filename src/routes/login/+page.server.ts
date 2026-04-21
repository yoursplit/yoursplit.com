import type { PageServerLoad, Actions } from './$types';
import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from "sveltekit-superforms/adapters";
import { googleLoginFormSchema } from './google-login-form-schema';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession();
  if (session) {
    redirect(303, '/account');
  }

  return {
    googleLoginForm: await superValidate(zod4(googleLoginFormSchema)),
  };
};

export const actions: Actions = {
  google: async (event) => {
    const googleLoginForm = await superValidate(event, zod4(googleLoginFormSchema));
    if (!googleLoginForm.valid) {
      return fail(400, {
        googleLoginForm,
      });
    }

    const { locals: { supabase } } = event;
    const { data, error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${event.url.origin}/auth/callback`,
      }
    });
    if (authError) {
      error(500);
    }
    if (data.url) {
      redirect(303, data.url);
    }

    return {
      googleLoginForm,
    };
  }
};
