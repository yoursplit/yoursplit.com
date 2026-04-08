<script lang="ts">
  import type { PageProps } from './$types';
  import WorkoutForm from './workout-form.svelte';

  let { data }: PageProps = $props();
</script>

<div class="flex flex-col items-center gap-8 my-auto">
  <div class="flex flex-col items-center gap-4">
    <h1 class="text-4xl text-center font-semibold">Edit your Workout Routine</h1>
    <p class="text-center text-muted-foreground">Design your personalized workout plan</p>
  </div>

  <div class="w-full max-w-96 flex flex-col gap-8">
    <WorkoutForm {data} />
  </div>
</div>
