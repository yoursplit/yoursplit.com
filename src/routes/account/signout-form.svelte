<script lang="ts">
  import type { PageData } from './$types';
  import * as Form from '$lib/components/ui/form';
  import * as Alert from '$lib/components/ui/alert';
  import { superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { signoutFormSchema } from './signout-form-schema';
  import Loader2Icon from '@lucide/svelte/icons/loader-2';
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';

  let { data }: { data: PageData } = $props();

  let signoutError = $state(false);

  // svelte-ignore state_referenced_locally
  const signoutForm = superForm(data.signoutForm, {
    validators: zod4Client(signoutFormSchema),
    onSubmit: () => {
      signoutError = false;
    },
    onError: () => {
      signoutError = true;
    }
  });
  const { enhance, submitting } = signoutForm;
</script>

<form class="w-full flex flex-col gap-4" method="POST" action="?/signout" use:enhance>
  <Form.Button variant="destructive" disabled={$submitting}>
    {#if $submitting}
      <Loader2Icon class="animate-spin" />
    {/if}
    Sign out
  </Form.Button>
  {#if signoutError}
    <Alert.Root variant="destructive">
      <AlertCircleIcon />
      <Alert.Title>Something went wrong while signing out</Alert.Title>
      <Alert.Description>Please try again later</Alert.Description>
    </Alert.Root>
  {/if}
</form>
