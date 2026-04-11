<script lang="ts">
  import type { PageProps } from './$types';
  import Seo from '$lib/components/seo.svelte';
  import AccountForm from './account-form.svelte';
  import SignoutForm from './signout-form.svelte';
  import * as Card from '$lib/components/ui/card';
  import * as Separator from '$lib/components/ui/separator';

  let { data }: PageProps = $props();
</script>

<Seo title="Account" />

<div class="container max-w-2xl mx-auto py-8 sm:py-12 px-2 sm:px-4 md:px-6 relative">
  <!-- Glowing background elements -->
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl aspect-square bg-primary/10 rounded-full blur-[120px] opacity-70 pointer-events-none"></div>

  <div class="flex flex-col items-center gap-12 relative z-10 w-full">
    <div class="flex flex-col items-center gap-3 sm:gap-4">
      <h1 class="text-3xl sm:text-5xl text-center font-bold tracking-tight text-foreground">
        Account <span class="text-primary">Settings</span>
      </h1>
      <p class="text-base sm:text-lg text-center text-muted-foreground font-medium max-w-md px-2">
        Manage your profile information and preferences
      </p>
    </div>

    <Card.Root class="w-full border-border bg-background/60 backdrop-blur-xl shadow-xl overflow-hidden">
      <Card.Content class="p-6 sm:p-8">
        <div class="w-full flex gap-3 flex-col mb-8">
          <h2 class="text-xl font-semibold text-foreground tracking-tight">Profile Details</h2>
          <AccountForm {data} />
        </div>
        
        <Separator.Root class="my-8 bg-border/60" />
        
        <div class="w-full flex flex-col items-center text-center gap-3">
          <h2 class="text-xl font-semibold text-destructive tracking-tight">Danger Zone</h2>
          <p class="text-sm text-muted-foreground mb-4">Log out of your current session.</p>
          <div class="w-40">
            <SignoutForm {data} />
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</div>

