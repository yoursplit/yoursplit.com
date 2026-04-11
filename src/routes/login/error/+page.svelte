<script lang="ts">
  import Seo from '$lib/components/seo.svelte';
  import { Button } from '$lib/components/ui/button';
  import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
</script>

<Seo title="Login Error" />

<div class="flex flex-col items-center gap-6 sm:gap-8 my-auto w-full px-2">
  <div class="flex flex-col items-center gap-3 sm:gap-4 max-w-md">
    <h1 class="text-3xl sm:text-4xl text-center font-semibold">Something went wrong</h1>
    <p class="text-center text-sm sm:text-base text-muted-foreground">
      Sorry, we encountered an error while logging you in.
      <br />
      Please try again later.
    </p>
  </div>

  <Button size="lg" href="/login">
    <ArrowLeftIcon />
    Back to Login
  </Button>
</div>
