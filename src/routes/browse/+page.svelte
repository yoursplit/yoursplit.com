<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageProps } from './$types';
  import Seo from '$lib/components/seo.svelte';
  import WorkoutCard from '$lib/components/workout-card.svelte';
  import * as Pagination from '$lib/components/ui/pagination';

  let { data }: PageProps = $props();

  const workoutTypeOptions = [
    { label: 'All', value: null },
    { label: 'Strength', value: 'strength' },
    { label: 'Cardio', value: 'cardio' },
    { label: 'Flexibility', value: 'flexibility' },
    { label: 'Calisthenics', value: 'calisthenics' },
  ] as const;

  const workoutDifficultyOptions = [
    { label: 'All', value: null },
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
  ] as const;

  const filterButtonClass =
    'px-5 py-2 rounded-full border border-border bg-background text-foreground hover:bg-muted text-sm transition-all';
  const activeFilterButtonClass =
    'px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm shadow-sm transition-all';

  const browseHref = (
    page: number,
    workoutType: string | null = data.workoutType,
    workoutDifficulty: string | null = data.workoutDifficulty,
  ) => {
    const params = new URLSearchParams();

    if (workoutType) {
      params.set('type', workoutType);
    }

    if (workoutDifficulty) {
      params.set('difficulty', workoutDifficulty);
    }

    if (page > 1) {
      params.set('page', String(page));
    }

    const query = params.toString();
    return query ? `/browse?${query}` : '/browse';
  };

  const handlePageChange = async (nextPage: number) => {
    if (nextPage === data.page) {
      return;
    }

    await goto(browseHref(nextPage), {
      keepFocus: true,
      noScroll: true,
    });
  };

  const handleTypeFilterChange = async (nextType: string | null) => {
    if (nextType === data.workoutType) {
      return;
    }

    await goto(browseHref(1, nextType, data.workoutDifficulty), {
      keepFocus: true,
      noScroll: true,
    });
  };

  const handleDifficultyFilterChange = async (nextDifficulty: string | null) => {
    if (nextDifficulty === data.workoutDifficulty) {
      return;
    }

    await goto(browseHref(1, data.workoutType, nextDifficulty), {
      keepFocus: true,
      noScroll: true,
    });
  };
</script>

<Seo title="Browse" />

<div class="flex flex-col items-center gap-10 sm:gap-16 my-6 sm:my-8">
  <div class="flex flex-col items-center gap-3 sm:gap-4 mb-2">
    <h1 class="text-3xl sm:text-5xl text-center font-bold tracking-tight text-foreground mb-2">
      Discover Your Next <span class="text-primary">Workout</span>
    </h1>
    <p class="text-base sm:text-lg text-center text-muted-foreground font-medium max-w-lg px-2">
      Browse community-created workout routines and start your fitness journey today
    </p>

    <div class="flex flex-col items-center gap-4 mt-6 w-full max-w-4xl justify-center font-medium">
      <div class="flex flex-wrap items-center justify-center gap-2">
        <span class="text-muted-foreground text-sm flex items-center gap-1.5 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            /></svg
          >
          Type:
        </span>

        {#each workoutTypeOptions as option}
          <button
            type="button"
            class={option.value === data.workoutType ? activeFilterButtonClass : filterButtonClass}
            aria-pressed={option.value === data.workoutType}
            onclick={() => handleTypeFilterChange(option.value)}
          >
            {option.label}
          </button>
        {/each}
      </div>

      <div class="flex flex-wrap items-center justify-center gap-2">
        <span class="text-muted-foreground text-sm mr-2">Difficulty:</span>

        {#each workoutDifficultyOptions as option}
          <button
            type="button"
            class={option.value === data.workoutDifficulty ? activeFilterButtonClass : filterButtonClass}
            aria-pressed={option.value === data.workoutDifficulty}
            onclick={() => handleDifficultyFilterChange(option.value)}
          >
            {option.label}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <div class="text-sm text-muted-foreground font-medium">Showing {data.totalWorkoutRoutines} workouts</div>

  {#if data.workoutRoutines.length === 0}
    <p class="text-lg text-muted-foreground">No routines found on this page.</p>
  {:else}
    <div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
      {#each data.workoutRoutines as workoutRoutine}
        <WorkoutCard {...workoutRoutine} />
      {/each}
    </div>
  {/if}

  <div class="w-full flex flex-col items-center gap-3">
    <Pagination.Root
      count={data.totalWorkoutRoutines}
      perPage={data.pageSize}
      page={data.page}
      onPageChange={handlePageChange}
    >
      {#snippet children({ pages, currentPage })}
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.PrevButton />
          </Pagination.Item>

          {#each pages as page (page.key)}
            {#if page.type === 'ellipsis'}
              <Pagination.Item>
                <Pagination.Ellipsis />
              </Pagination.Item>
            {:else}
              <Pagination.Item>
                <Pagination.Link {page} isActive={currentPage === page.value}>
                  {page.value}
                </Pagination.Link>
              </Pagination.Item>
            {/if}
          {/each}

          <Pagination.Item>
            <Pagination.NextButton />
          </Pagination.Item>
        </Pagination.Content>
      {/snippet}
    </Pagination.Root>
    <p class="text-sm text-muted-foreground">Page {data.page}</p>
  </div>
</div>
