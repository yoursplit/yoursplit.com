<script lang="ts">
  import type { PageProps } from './$types';
  import GoogleLoginForm from './google-login-form.svelte';
  import * as Card from '$lib/components/ui/card';

  let { data }: PageProps = $props();
</script>

<div class="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] w-full py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
  <!-- Decorative background elements -->
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg aspect-square bg-primary/20 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>

  <Card.Root class="w-full max-w-md relative z-10 border-border bg-background/60 backdrop-blur-xl shadow-2xl">
    <Card.Header class="space-y-1 mt-4">
      <Card.Title class="text-3xl font-bold tracking-tight text-center text-foreground">Welcome back</Card.Title>
      <Card.Description class="text-center text-muted-foreground pt-2">
        Sign in or create an account to save your routines
      </Card.Description>
    </Card.Header>
    <Card.Content class="grid gap-4 mt-4 mb-4 pb-6">
      <GoogleLoginForm {data} />
    </Card.Content>
  </Card.Root>
</div>

