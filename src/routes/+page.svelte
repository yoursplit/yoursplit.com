<script lang="ts">
  import Seo from '$lib/components/seo.svelte';
  import { Button, buttonVariants } from '$lib/components/ui/button';
</script>

<Seo />

<div class="relative w-full flex flex-col items-center justify-center pt-12 sm:pt-24 pb-12 sm:pb-16 text-center max-w-4xl mx-auto my-auto gap-6 sm:gap-8">
  <div class="absolute left-1/2 top-1/2 h-80 w-80 sm:h-125 sm:w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px] -z-10"></div>
  
  <span class="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary font-semibold text-sm shadow-sm flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    Literally so simple
  </span>
  
  <h1 class="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
    Never Miss Your Workout Routine <br><span class="text-primary">Ever Again</span>
  </h1>
  
  <p class="text-base sm:text-xl text-muted-foreground font-medium max-w-2xl px-4">
    Create, discover and share workout routines tailored for any needs.
  </p>
  
  <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-6 sm:mt-8 w-full sm:w-auto">
    <a href="/browse" class="{buttonVariants({ variant: 'default', size: 'lg' })} rounded-xl font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg transition-transform hover:scale-105 shadow-lg shadow-primary/20 w-full sm:w-auto">
      Explore Workouts
    </a>
    <a href="/new" class="{buttonVariants({ variant: 'outline', size: 'lg' })} rounded-xl font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg transition-all w-full sm:w-auto">
      Create a Plan
    </a>
  </div>
</div>
