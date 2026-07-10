import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
  const {
    url,
	  locals: { supabase }
  } = event;
  const code = url.searchParams.get('code') as string;
  const nextParam = url.searchParams.get('next');
  const next = nextParam && /^\/(?!\/|\\)[^\\]*$/.test(nextParam) ? nextParam : '/account';
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(303, next);
    }
  }
  redirect(303, '/login/error');
};
