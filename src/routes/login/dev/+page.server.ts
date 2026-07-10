import type { PageServerLoad, Actions } from './$types';
import { fail, error, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { superValidate, setError } from 'sveltekit-superforms';
import { zod4 } from "sveltekit-superforms/adapters";
import { loginFormSchema } from './login-form-schema';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  if (!dev) {
    error(404, 'Not Found');
  }

  const { session } = await safeGetSession();
  if (session) {
    redirect(303, '/account');
  }

  return {
    loginForm: await superValidate(zod4(loginFormSchema)),
  };
};

export const actions: Actions = {
  default: async (event) => {
    if (!dev) {
      error(404, 'Not Found');
    }

    const loginForm = await superValidate(event, zod4(loginFormSchema));
    if (!loginForm.valid) {
      return fail(400, {
        loginForm,
      });
    }

    const { locals: { supabase } } = event;
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginForm.data.email,
      password: loginForm.data.password
    });
    if (authError) {
      if (authError.code === 'invalid_credentials') {
        setError(loginForm, 'email', '');
        return setError(loginForm, 'password', 'Invalid email or password');
      } else {
        error(500);
      }
    }

    return {
      loginForm,
    };
  },
};
