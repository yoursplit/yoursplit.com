<script lang="ts">
  import type { PageProps } from './$types';
  import { Button } from '$lib/components/ui/button';
  import * as Avatar from '$lib/components/ui/avatar';
  import * as Empty from '$lib/components/ui/empty';
  import WorkoutCard from '$lib/components/workout-card.svelte';
  import UserIcon from '@lucide/svelte/icons/user';

  let { data }: PageProps = $props();
</script>

<div class="flex flex-col gap-10 sm:gap-16 my-auto">
  <div class="flex flex-col md:flex-row gap-10 sm:gap-16">
    <div class="md:basis-1/2 flex flex-col items-center gap-4">
      <Avatar.Root class="size-16">
        <Avatar.Image src={data.userProfile.avatar_url} alt="Profile picture" />
        <Avatar.Fallback>
          <UserIcon />
        </Avatar.Fallback>
      </Avatar.Root>
      <h1 class="text-xl sm:text-2xl text-center font-semibold wrap-break-word">{data.userProfile.full_name}</h1>
      <p class="text-base sm:text-lg text-muted-foreground text-center break-all">@{data.userProfile.username}</p>
    </div>

    <div class="md:basis-1/2 flex flex-col gap-4">
      <h2 class="text-xl text-center md:text-left font-semibold">
        {data.numWorkoutRoutines} Workout {data.numWorkoutRoutines === 1 ? 'Routine' : 'Routines'}
      </h2>

      {#if data.workoutRoutines.length > 0}
        <div class="grid grid-cols-1 gap-4">
          {#each data.workoutRoutines as workoutRoutine}
            <WorkoutCard {...workoutRoutine} />
          {/each}
        </div>
      {:else}
        <Empty.Root>
          <Empty.Header>
            <Empty.Title>No content</Empty.Title>
            <Empty.Description>This user has no content</Empty.Description>
          </Empty.Header>
        </Empty.Root>
      {/if}
    </div>
  </div>

  {#if data.profile?.username === data.userProfile.username}
    <div class="flex justify-center">
      <Button href="/account">
        Edit profile
      </Button>
    </div>
  {/if}
</div>
