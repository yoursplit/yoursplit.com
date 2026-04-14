<script lang="ts">
  import type { PageData } from './$types';
  import * as Form from '$lib/components/ui/form';
  import { Input } from '$lib/components/ui/input';
  import * as InputGroup from '$lib/components/ui/input-group';
  import { Label } from '$lib/components/ui/label';
  import * as Item from '$lib/components/ui/item';
  import * as Alert from '$lib/components/ui/alert';
  import { toast } from 'svelte-sonner';
  import { superForm } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { accountFormSchema } from './account-form-schema';
  import Loader2Icon from '@lucide/svelte/icons/loader-2';
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
  import MailIcon from '@lucide/svelte/icons/mail';
  import LinkIcon from '@lucide/svelte/icons/link';
  import GoogleIcon from '$lib/assets/icons/google-icon.svelte';

  let { data }: { data: PageData } = $props();

  let updateError = $state(false);

  // svelte-ignore state_referenced_locally
  const accountForm = superForm(data.accountForm, {
    validators: zod4Client(accountFormSchema),
    resetForm: false,
    onSubmit: () => {
      updateError = false;
    },
    onUpdated: ({ form: f }) => {
      if (f.valid) {
        toast.success('Profile updated successfully');
      }
    },
    onError: () => {
      updateError = true;
    }
  });
  const { form: formData, enhance, submitting } = accountForm;
</script>

<form class="w-full flex flex-col gap-8" method="POST" action="?/update" use:enhance>
  <Form.Field form={accountForm} name="full_name">
    <Form.Control>
      {#snippet children({ props })}
        <Form.Label>Display Name</Form.Label>
        <Input {...props} bind:value={$formData.full_name} />
      {/snippet}
    </Form.Control>
    <Form.Description>Enter your full name or a preferred display name.</Form.Description>
    <Form.FieldErrors />
  </Form.Field>

  <div class="flex flex-col gap-4">
    {#if data.hasDefaultUsername}
      <Alert.Root>
        <AlertCircleIcon />
        <Alert.Title>Set your username</Alert.Title>
        <Alert.Description>
          It looks like you are using a default username. Please set a unique username for your account.
        </Alert.Description>
      </Alert.Root>
    {/if}

    <Form.Field form={accountForm} name="username">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Username</Form.Label>
          <InputGroup.Root>
            <InputGroup.Addon>@</InputGroup.Addon>
            <InputGroup.Input
              {...props}
              bind:value={$formData.username}
              placeholder={data.hasDefaultUsername ? 'Set a username' : ''}
            />
          </InputGroup.Root>
        {/snippet}
      </Form.Control>
      <Form.Description>Use lowercase letters, numbers, and dashes only.</Form.Description>
      <Form.FieldErrors />
    </Form.Field>
  </div>

  <div class="flex flex-col gap-2 mb-2">
    <Label for="email">Email</Label>
    <Input id="email" type="email" disabled value={data.session.user.email} />
    <p class="text-sm text-muted-foreground">Your email address cannot be changed.</p>
  </div>

  <div class="flex flex-col gap-2">
    <Label>Connected Providers</Label>
    <div class="flex flex-col gap-2">
      {#each data.session.user.app_metadata.providers as provider}
        <Item.Root variant="outline" size="sm">
          <Item.Media class="size-4">
            {#if provider === 'google'}
              <GoogleIcon />
            {:else if provider === 'email'}
              <MailIcon />
            {:else}
              <LinkIcon />
            {/if}
          </Item.Media>
          <Item.Content>
            <Item.Title>Sign in with {provider.charAt(0).toUpperCase() + provider.slice(1)}</Item.Title>
          </Item.Content>
          <Item.Actions class="text-green-500">
            Connected
          </Item.Actions>
        </Item.Root>
      {/each}
    </div>
  </div>

  <Form.Button class="mt-4" disabled={$submitting}>
    {#if $submitting}
      <Loader2Icon class="animate-spin" />
    {/if}
    Save
  </Form.Button>

  {#if updateError}
    <Alert.Root variant="destructive">
      <AlertCircleIcon />
      <Alert.Title>Something went wrong</Alert.Title>
      <Alert.Description>
        We encountered an issue while updating your profile. Please try again later.
      </Alert.Description>
    </Alert.Root>
  {/if}
</form>
