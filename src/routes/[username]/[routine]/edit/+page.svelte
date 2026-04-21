<script lang="ts">
  import type { PageProps } from './$types';
  import Seo from '$lib/components/seo.svelte';
  import WorkoutForm from './workout-form.svelte';

  let { data }: PageProps = $props();
</script>

<Seo title={`Edit ${data.workoutForm.data.name}`} />

<div class="flex flex-col items-center gap-8 sm:gap-12 my-6 sm:my-8 w-full max-w-360 sm:px-6 mx-auto">
  <div class="flex flex-col items-center gap-2">
    <h1 class="text-3xl sm:text-5xl text-center font-bold tracking-tight text-foreground mb-2">
      Edit Your <span class="text-blue-500">Workout</span> Plan
    </h1>
    <p class="text-base sm:text-lg text-center text-muted-foreground font-medium px-2">Design a custom workout schedule with exercises for each day</p>
  </div>

  <div class="w-full flex justify-center">
    <WorkoutForm {data} />
  </div>
</div>
