<script lang="ts">
  import { enhance } from '$app/forms';
  import Seo from '$lib/components/seo.svelte';
  import { Button } from '$lib/components/ui/button';

  let isCreating = $state(false);

  const enhanceCreateRoutine = () => {
    isCreating = true;

    return async ({ update }: { update: () => Promise<void> }) => {
      await update();
      isCreating = false;
    };
  };
</script>

<Seo title="New Workout Routine" />

<section class="relative mx-auto my-auto flex min-h-136 w-full max-w-3xl flex-col items-center justify-center gap-8 sm:gap-10 px-4 sm:px-6 py-10 sm:py-14 text-center">
  <div class="pointer-events-none absolute inset-0 -z-10">
    <div class="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"></div>
  </div>

  <div class="space-y-3">
    <p class="text-sm tracking-[0.18em] text-primary uppercase font-semibold">New Routine</p>
    <h1 class="text-3xl font-bold sm:text-6xl text-foreground tracking-tight">Create. Save. <span class="text-primary">Share.</span></h1>
    <p class="text-muted-foreground text-base sm:text-lg mt-4 max-w-lg mx-auto px-2">Create and save a workout routine to never forget your split.</p>
  </div>

  <form method="POST" action="?/create" use:enhance={enhanceCreateRoutine} class="flex h-32 items-center justify-center">
    <div class={isCreating ? 'create-button-shake' : ''}>
      <Button
        type="submit"
        size="lg"
        disabled={isCreating}
        class="rounded-xl font-bold px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg"
      >
        {isCreating ? 'Creating...' : 'Create Workout Routine'}
      </Button>
    </div>
  </form>
</section>

<style>
  .create-button-shake {
    animation: create-button-shake 0.45s ease-in-out infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .create-button-shake {
      animation: none;
    }
  }

  @keyframes create-button-shake {
    0%,
    100% {
      transform: translateX(0);
    }

    25% {
      transform: translateX(-2px) rotate(-1deg);
    }

    75% {
      transform: translateX(2px) rotate(1deg);
    }
  }
</style>
