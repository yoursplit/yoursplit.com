<script lang="ts">
  import type { PageData } from './$types';
  import * as Form from '$lib/components/ui/form';
  import * as Alert from '$lib/components/ui/alert';
  import { superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { googleLoginFormSchema } from './google-login-form-schema';
  import Loader2Icon from '@lucide/svelte/icons/loader-2';
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
  import GoogleIcon from '$lib/assets/icons/google-icon.svelte';

  let { data }: { data: PageData } = $props();

  let googleError = $state(false);

  const googleLoginForm = superForm(data.googleLoginForm, {
    validators: zod4Client(googleLoginFormSchema),
    onSubmit: () => {
      googleError = false;
    },
    onError: () => {
      googleError = true;
    }
  });
  const { enhance, submitting } = googleLoginForm;
</script>

<form class="w-full flex flex-col gap-4" method="POST" action="?/google" use:enhance>
  <Form.Button size="lg" disabled={$submitting} class="w-full h-12 text-base font-semibold shadow-md transition-all">
    {#if $submitting}
      <Loader2Icon class="animate-spin mr-2 h-5 w-5" />
    {:else}
      <div class="mr-3 h-5 w-5 fill-current">
        <GoogleIcon />
      </div>
    {/if}
    Continue with Google
  </Form.Button>
  {#if googleError}
    <Alert.Root variant="destructive" class="mt-2 border-red-500/50 bg-red-500/10">
      <AlertCircleIcon class="h-4 w-4 text-red-500" />
      <Alert.Title class="text-red-500 font-medium">Authentication Failed</Alert.Title>
      <Alert.Description class="text-red-400">Unable to sign in with Google. Please try again later.</Alert.Description>
    </Alert.Root>
  {/if}
</form>
