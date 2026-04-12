<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import { onMount } from 'svelte';
  import { invalidate } from '$app/navigation';
  import { navigating } from '$app/state';
  import { fade } from 'svelte/transition';
  import { ModeWatcher } from 'mode-watcher';
  import { Toaster } from '$lib/components/ui/sonner';
  import Header from '$lib/components/header.svelte';
  import Footer from '$lib/components/footer.svelte';

  let { children, data } = $props();
  let { supabase, session } = $derived(data);

  onMount(() => {
    const { data: authData } = supabase.auth.onAuthStateChange((authEvent, newSession) => {
      if (newSession?.expires_at !== session?.expires_at) {
        invalidate('supabase:auth');
      }
    });

    return () => authData.subscription.unsubscribe();
  });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher defaultMode="dark" />

<Toaster richColors />

{#if navigating.to}
  <div
    class="fixed top-0 left-0 z-50 h-1 w-full animate-slide-gradient bg-linear-to-r from-primary via-indigo-500 to-primary bg-size-[200%_100%]"
    in:fade={{ delay: 300 }}
  ></div>
{/if}

<div class="min-h-screen max-w-7xl flex flex-col mx-auto">
  <Header />

  <main class="grow flex flex-col px-8 md:px-16 py-8">
    {@render children?.()}
  </main>

  <Footer />
</div>
