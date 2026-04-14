<script lang="ts">
  import type { PageData } from './$types';
  import * as Form from '$lib/components/ui/form';
  import { Input } from '$lib/components/ui/input';
  import * as Alert from '$lib/components/ui/alert';
  import { superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { loginFormSchema } from './login-form-schema';
  import Loader2Icon from '@lucide/svelte/icons/loader-2';
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';

  let { data }: { data: PageData } = $props();

  let loginError = $state(false);

  // svelte-ignore state_referenced_locally
  const loginForm = superForm(data.loginForm, {
    validators: zod4Client(loginFormSchema),
    resetForm: false,
    onSubmit: () => {
      loginError = false;
    },
    onError: () => {
      loginError = true;
    }
  });
  const { form: formData, enhance, submitting } = loginForm;
</script>

<form class="w-full flex flex-col gap-4" method="POST" use:enhance>
  <Form.Field form={loginForm} name="email">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Email</Form.Label>
        <Input class="h-10" type="email" {...props} bind:value={$formData.email} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field form={loginForm} name="password">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Password</Form.Label>
        <Input class="h-10" type="password" {...props} bind:value={$formData.password} />
      {/snippet}
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Button size="lg" variant="secondary" disabled={$submitting}>
    {#if $submitting}
      <Loader2Icon class="animate-spin" />
    {/if}
    Log in
  </Form.Button>
  {#if loginError}
    <Alert.Root variant="destructive">
      <AlertCircleIcon />
      <Alert.Title>Something went wrong</Alert.Title>
      <Alert.Description>Please try again later</Alert.Description>
    </Alert.Root>
  {/if}
</form>
