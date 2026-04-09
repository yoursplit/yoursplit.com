import type { PageServerLoad } from './$types';
import { getPreviews } from '$lib/server/workout-routines';

const PAGE_SIZE = 12;

export const load: PageServerLoad = async ({ locals: { supabase }, url }) => {
  const pageParam = Number.parseInt(url.searchParams.get('page') ?? '1', 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const offset = (page - 1) * PAGE_SIZE;

  const workoutRoutinesWithProbe = await getPreviews(supabase, {
    limit: PAGE_SIZE + 1,
    offset,
  });

  const hasNextPage = workoutRoutinesWithProbe.length > PAGE_SIZE;
  const workoutRoutines = hasNextPage
    ? workoutRoutinesWithProbe.slice(0, PAGE_SIZE)
    : workoutRoutinesWithProbe;

  return {
    workoutRoutines,
    page,
    hasNextPage,
    hasPreviousPage: page > 1,
  };
};
