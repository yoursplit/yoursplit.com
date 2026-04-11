<script lang="ts">
  import { goto } from '$app/navigation';
  import type { PageProps } from './$types';
  import WorkoutCard from '$lib/components/workout-card.svelte';
  import * as Pagination from '$lib/components/ui/pagination';

  let { data }: PageProps = $props();

  const browseHref = (page: number) => (page <= 1 ? '/browse' : `/browse?page=${page}`);

  const handlePageChange = async (nextPage: number) => {
    if (nextPage === data.page) {
      return;
    }

    await goto(browseHref(nextPage), {
      keepFocus: true,
      noScroll: true,
    });
  };
</script>

<div class="flex flex-col items-center gap-10 sm:gap-16 my-6 sm:my-8">
  <div class="flex flex-col items-center gap-3 sm:gap-4 mb-2">
    <h1 class="text-3xl sm:text-5xl text-center font-bold tracking-tight text-foreground mb-2">
      Discover Your Next <span class="text-primary">Workout</span>
    </h1>
    <p class="text-base sm:text-lg text-center text-muted-foreground font-medium max-w-lg px-2">
      Browse community-created workout routines and start your fitness journey today
    </p>

    <!-- TODO: maybe implement search and filters later 
    <-!- Search -!->
    <div class="relative w-full max-w-2xl mt-8">
      <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>
      <input type="text" placeholder="Search workouts..." class="w-full bg-background border border-input text-foreground placeholder:text-muted-foreground rounded-full py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm h-14 text-base" />
    </div>

    <-!- Filters -!->
    <div class="flex flex-col sm:flex-row items-center gap-4 mt-6 w-full max-w-4xl justify-center font-medium">
      <div class="flex items-center gap-2">
        <span class="text-muted-foreground text-sm flex items-center gap-1.5 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
          Filters:
        </span>
        <button class="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm shadow-sm transition-all">All</button>
        <button class="px-5 py-2 rounded-full border border-border bg-background text-foreground hover:bg-muted text-sm transition-all">Strength</button>
        <button class="px-5 py-2 rounded-full border border-border bg-background text-foreground hover:bg-muted text-sm transition-all">Cardio</button>
        <button class="px-5 py-2 rounded-full border border-border bg-background text-foreground hover:bg-muted text-sm transition-all">Core</button>
        <button class="px-5 py-2 rounded-full border border-border bg-background text-foreground hover:bg-muted text-sm transition-all">Flexibility</button>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm shadow-sm transition-all ml-2">All</button>
        <button class="px-5 py-2 rounded-full border border-border bg-background text-foreground hover:bg-muted text-sm transition-all">Beginner</button>
        <button class="px-5 py-2 rounded-full border border-border bg-background text-foreground hover:bg-muted text-sm transition-all">Intermediate</button>
        <button class="px-5 py-2 rounded-full border border-border bg-background text-foreground hover:bg-muted text-sm transition-all">Advanced</button>
      </div>
    </div>
    -->
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
