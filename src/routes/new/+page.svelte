<script lang="ts">
  import { Button } from '$lib/components/ui/button';
</script>

<section class="relative mx-auto my-auto flex min-h-136 w-full max-w-3xl flex-col items-center justify-center gap-8 sm:gap-10 px-4 sm:px-6 py-10 sm:py-14 text-center">
  <div class="pointer-events-none absolute inset-0 -z-10">
    <div class="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl"></div>
  </div>

  <div class="space-y-3">
    <p class="text-sm tracking-[0.18em] text-primary uppercase font-semibold">New Routine</p>
    <h1 class="text-3xl font-bold sm:text-6xl text-foreground tracking-tight">Create. Save. <span class="text-primary">Share.</span></h1>
    <p class="text-muted-foreground text-base sm:text-lg mt-4 max-w-lg mx-auto px-2">Create and save a workout routine to never forget your split.</p>
  </div>

  <form method="POST" action="?/create" class="flex h-32 items-center justify-center">
    <Button type="submit" size="lg" class="rounded-xl font-bold px-6 sm:px-8 h-12 sm:h-14 text-base sm:text-lg">Create Workout Routine</Button>
  </form>
</section>
