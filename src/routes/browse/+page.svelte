<script lang="ts">
  import type { PageProps } from './$types';
  import WorkoutCard from '$lib/components/workout-card.svelte';
  import { Button } from '$lib/components/ui/button';

  let { data }: PageProps = $props();

  const browseHref = (page: number) => (page <= 1 ? '/browse' : `/browse?page=${page}`);
</script>

<div class="flex flex-col items-center gap-16 my-8">
  <div class="flex flex-col items-center gap-4">
    <h1 class="text-4xl text-center font-bold">
      Discover Your Next
      <span class="text-blue-500">Workout Routine</span>
    </h1>
    <p class="text-lg text-center text-muted-foreground">
      Browse community-created workout routines and start your fitness journey today
    </p>
  </div>

  {#if data.workoutRoutines.length === 0}
    <p class="text-lg text-muted-foreground">No routines found on this page.</p>
  {:else}
    <div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each data.workoutRoutines as workoutRoutine}
        <WorkoutCard {...workoutRoutine} />
      {/each}
    </div>
  {/if}

  <div class="w-full flex items-center justify-center gap-3">
    <Button href={browseHref(data.page - 1)} variant="outline" disabled={!data.hasPreviousPage}>
      Previous
    </Button>
    <p class="text-sm text-muted-foreground">Page {data.page}</p>
    <Button href={browseHref(data.page + 1)} variant="outline" disabled={!data.hasNextPage}>
      Next
    </Button>
  </div>
</div>
