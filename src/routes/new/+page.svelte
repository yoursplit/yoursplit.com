<script lang="ts">
  import { Button } from '$lib/components/ui/button';
</script>

<section class="relative mx-auto my-auto flex min-h-136 w-full max-w-3xl flex-col items-center justify-center gap-10 px-6 py-14 text-center">
  <div class="pointer-events-none absolute inset-0 -z-10">
    <div class="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-tr from-sky-300/85 via-cyan-200/70 to-emerald-200/75 dark:from-sky-200/55 dark:via-cyan-100/45 dark:to-emerald-100/50 blur-3xl"></div>
  </div>

  <div class="space-y-3">
    <p class="text-sm tracking-[0.18em] text-muted-foreground uppercase">New Routine</p>
    <h1 class="text-4xl font-semibold sm:text-5xl">Start from scratch.</h1>
  </div>

  <form method="POST" action="?/create" class="flex h-56 items-center justify-center">
    <Button type="submit" size="lg" class="h-12 min-w-56 text-base">Create Workout Routine</Button>
  </form>
</section>
