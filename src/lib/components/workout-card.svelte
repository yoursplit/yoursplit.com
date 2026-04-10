<script module lang="ts">
  export type DayPreview = {
    dayLabel?: string;
    numExercises: number;
  };
  export type WorkoutRoutineCardProps = {
    name: string;
    href: string;
    usesNumberedDays: boolean;
    daysPreview: DayPreview[];
    totalExercises: number;
  };
</script>

<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Separator } from '$lib/components/ui/separator';
  import { toast } from 'svelte-sonner';

  let { name, href, usesNumberedDays, daysPreview, totalExercises }: WorkoutRoutineCardProps = $props();

  const workoutDaysCount = $derived(daysPreview.filter(d => d.numExercises > 0).length);
  const restDaysCount = $derived(daysPreview.length - workoutDaysCount);
  
  const AVG_MIN_PER_EXERCISE = 10;
  const avgDurationPerWorkoutDay = $derived(workoutDaysCount > 0 ? Math.round((totalExercises * AVG_MIN_PER_EXERCISE) / workoutDaysCount) : 0);

  const shareWorkout = (e: MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const url = new URL(href, window.location.origin).toString();
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };
</script>

<a {href}>
  <Card.Root class="hover:border-primary/50 transition-all card-shadow rounded-2xl overflow-hidden">
    <Card.Header class="pb-2">
      <div class="flex items-start justify-between gap-4">
        <Card.Title class="text-xl font-bold text-foreground">{name}</Card.Title>
        <button class="flex items-center gap-1.5 px-3 py-1 bg-background border border-primary/20 text-primary text-xs font-semibold rounded-full hover:bg-primary/10 transition-colors" onclick={shareWorkout}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          Share
        </button>
      </div>
    </Card.Header>
    <Card.Content class="pt-4">
      {#if daysPreview.length === 0}
        <p class="text-sm text-muted-foreground">No workout days yet</p>
      {:else}
        <ul class="flex flex-col gap-2">
          {#each daysPreview.slice(0, 3) as day, index}
            {@const dayLabel = day.dayLabel ? `: ${day.dayLabel}` : ''}
            <li class="flex flex-row gap-2 justify-between">
              <p class="text-sm text-muted-foreground font-medium">
                {#if usesNumberedDays}
                  Day {index + 1}{dayLabel}
                {:else}
                  {#if index === 0}
                    Monday{dayLabel}
                  {:else if index === 1}
                    Tuesday{dayLabel}
                  {:else if index === 2}
                    Wednesday{dayLabel}
                  {/if}
                {/if}
              </p>
              <p class="text-sm font-bold text-foreground">
                {day.numExercises} exercises
              </p>
            </li>
          {/each}
          {#if daysPreview.length > 3}
            <li class="mt-1">
              <p class="text-sm text-muted-foreground font-medium">+{daysPreview.length - 3} more workout days</p>
            </li>
          {/if}
        </ul>
      {/if}
    </Card.Content>
    <Separator class="bg-border" />
    <Card.Footer class="pt-4 flex items-center justify-between text-muted-foreground">
      <div class="flex items-center gap-2">
        <svg class="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <div class="flex flex-col leading-none">
          <span class="font-bold text-foreground">{avgDurationPerWorkoutDay}</span>
          <span class="text-[10px] text-muted-foreground">min/day</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <svg class="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
        <div class="flex flex-col leading-none">
          <span class="font-bold text-foreground">{workoutDaysCount}d on / {restDaysCount}d</span>
          <span class="text-[10px] text-muted-foreground">rest</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <svg class="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
        </svg>
        <div class="flex flex-col leading-none">
          <span class="font-bold text-foreground">{totalExercises}</span>
          <span class="text-[10px] text-muted-foreground">exercises</span>
        </div>
      </div>
    </Card.Footer>
  </Card.Root>
</a>
