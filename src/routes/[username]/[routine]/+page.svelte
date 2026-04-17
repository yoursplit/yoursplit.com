<script lang="ts">
  import type { PageProps } from './$types';
  import Seo from '$lib/components/seo.svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Table from '$lib/components/ui/table';
  import { Badge } from '$lib/components/ui/badge';
  import * as Card from '$lib/components/ui/card';
  import { toast } from 'svelte-sonner';
  import ProfileCard from '$lib/components/profile-card.svelte';
  import { WEEKDAYS } from '$lib/constants';

  let { data }: PageProps = $props();

  const weekdays = WEEKDAYS;

  const getDayTitle = (dayNumber: number) => {
    if (data.workoutRoutine.uses_numbered_days) {
      return `Day ${dayNumber}`;
    }

    return weekdays[dayNumber - 1] ?? `Day ${dayNumber}`;
  };

  const shareWorkout = (e: MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatEnumLabel = (value: string | null | undefined) => {
    if (!value) {
      return 'Not set';
    }

    return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
  };

  const workoutDaysCount = $derived(data.workoutDaysData?.filter(d => (d.workout_exercises?.length ?? 0) > 0).length ?? 0);
  const restDaysCount = $derived((data.workoutDaysData?.length ?? 0) - workoutDaysCount);
  const totalExercises = $derived(data.workoutDaysData?.reduce((acc, current) => acc + (current.workout_exercises?.length ?? 0), 0) ?? 0);

  // Assuming roughly 12 minutes per exercise for average duration calculation
  const AVG_MIN_PER_EXERCISE = 12;
  const avgDurationPerWorkoutDay = $derived(workoutDaysCount > 0 ? Math.round((totalExercises * AVG_MIN_PER_EXERCISE) / workoutDaysCount) : 0);
</script>

<Seo title={data.workoutRoutine.name} />

<div class="space-y-6 sm:space-y-8 max-w-5xl mx-auto w-full mt-2 sm:mt-4">
  <a href="/browse" class="flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors w-fit text-sm">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
    Back to Browse
  </a>

  <Card.Root class="rounded-2xl">
    <Card.Content class="p-6 sm:p-8">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex flex-col gap-4">
          <div>
            <h1 class="text-2xl sm:text-4xl font-bold tracking-tight text-foreground wrap-break-word">{data.workoutRoutine.name}</h1>
            {#if data.workoutRoutine.description}
              <p class="text-muted-foreground mt-2 text-base sm:text-lg wrap-break-word">{data.workoutRoutine.description}</p>
            {/if}
            <div class="mt-4 flex flex-wrap gap-3">
              <Badge variant="default" class="h-8 rounded-full px-4 text-sm font-semibold">
                {formatEnumLabel(data.workoutRoutine.workout_type)}
              </Badge>
              <Badge variant="secondary" class="h-8 rounded-full px-4 text-sm font-semibold">
                {formatEnumLabel(data.workoutRoutine.workout_difficulty)}
              </Badge>
            </div>
          </div>
          
          <a href={`/${data.userProfile.username}`} class="block w-fit bg-muted/40 rounded-xl hover:bg-muted/80 transition-colors">
            <ProfileCard profile={data.userProfile} class="p-3" />
          </a>
        </div>

        <div class="flex flex-wrap items-center gap-2 sm:gap-3 self-start">
          <Button variant="default" size="lg" class="rounded-xl font-semibold px-4 sm:px-6" onclick={shareWorkout}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Share Workout
          </Button>
          {#if data.profile?.username === data.userProfile.username}
            <Button href={`/${data.userProfile.username}/${data.workoutRoutine.slug}/edit`} variant="outline" class="rounded-xl">
              Edit
            </Button>
          {/if}
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-border flex flex-wrap gap-8 items-center text-foreground">
        <div class="flex items-center gap-4">
          <div class="h-12 w-12 rounded-full border border-border bg-muted flex items-center justify-center text-primary">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-muted-foreground font-medium">Avg Duration</span>
            <span class="text-lg font-bold">{avgDurationPerWorkoutDay} min/day</span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="h-12 w-12 rounded-full border border-border bg-muted flex items-center justify-center text-primary">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-muted-foreground font-medium">Weekly Split</span>
            <span class="text-lg font-bold">{workoutDaysCount} on / {restDaysCount} rest</span>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="h-12 w-12 rounded-full border border-border bg-muted flex items-center justify-center text-primary">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>
          </div>
          <div class="flex flex-col">
            <span class="text-xs text-muted-foreground font-medium">Total Exercises</span>
            <span class="text-lg font-bold">{totalExercises}</span>
          </div>
        </div>
      </div>
    </Card.Content>
  </Card.Root>

  <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-10 sm:mt-12 mb-4">Weekly Schedule</h2>
  
  {#if data.workoutDaysData}
    <div class="space-y-6">
      {#each data.workoutDaysData as day}
        <Card.Root class="rounded-2xl overflow-hidden shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border-b">
            <h3 class="font-bold text-lg sm:text-2xl text-foreground">
              {getDayTitle(day.day_number)}
            </h3>
            <div class="flex flex-wrap items-center gap-2">
              {#if day.day_focus?.trim()}
                <span class="px-5 py-2 rounded-full border border-primary/30 text-primary bg-primary/10 text-sm font-semibold">
                  {day.day_focus}
                </span>
              {/if}
              {#if !day.workout_exercises || day.workout_exercises.length === 0}
                <span class="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold border">
                  Rest Day
                </span>
              {/if}
            </div>
          </div>
          <div class="p-0">
            {#if day.workout_exercises && day.workout_exercises.length > 0}
              <div class="overflow-x-auto">
                <Table.Root class="w-full text-sm">
                  <Table.Header class="border-b">
                    <Table.Row class="hover:bg-transparent">
                      <Table.Head class="w-15 text-center font-bold py-4">#</Table.Head>
                      <Table.Head class="font-bold py-4 uppercase text-xs tracking-wide">Exercise</Table.Head>
                      <Table.Head class="font-bold py-4 uppercase text-xs tracking-wide">Sets</Table.Head>
                      <Table.Head class="font-bold py-4 uppercase text-xs tracking-wide">Reps</Table.Head>
                      <Table.Head class="font-bold py-4 uppercase text-xs tracking-wide">Weight</Table.Head>
                      <Table.Head class="font-bold py-4 uppercase text-xs tracking-wide">Notes</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {#each day.workout_exercises as exercise, index (exercise.id)}
                      <Table.Row class="border-b hover:bg-muted/50 transition-colors">
                        <Table.Cell class="font-bold text-muted-foreground text-center py-4">{index + 1}</Table.Cell>
                        <Table.Cell class="font-bold text-foreground py-4">{exercise.name}</Table.Cell>
                        <Table.Cell class="font-bold text-foreground py-4">{exercise.sets || '—'}</Table.Cell>
                        <Table.Cell class="font-bold text-primary py-4">{exercise.reps || '—'}</Table.Cell>
                        <Table.Cell class="font-bold text-foreground py-4">{exercise.weight ? `${exercise.weight} ${data.workoutRoutine.weight_unit || 'lbs'}` : '—'}</Table.Cell>
                        <Table.Cell class="text-muted-foreground py-4">{exercise.notes || '—'}</Table.Cell>
                      </Table.Row>
                    {/each}
                  </Table.Body>
                </Table.Root>
              </div>
            {:else}
              <div class="flex justify-center p-10 text-muted-foreground font-medium">
                {day.notes || "Take this day to rest and recover. Stay hydrated!"}
              </div>
            {/if}
          </div>
        </Card.Root>
      {/each}
    </div>
  {/if}
</div>
