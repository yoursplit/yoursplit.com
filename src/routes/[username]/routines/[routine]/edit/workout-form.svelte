<script lang="ts">
  import { page } from '$app/state';
  import * as Form from '$lib/components/ui/form';
  import { Input } from '$lib/components/ui/input';
  import * as InputGroup from '$lib/components/ui/input-group';
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Alert from '$lib/components/ui/alert';
  import * as Accordion from '$lib/components/ui/accordion';
  import { Button } from '$lib/components/ui/button';
  import { toast } from 'svelte-sonner';
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { workoutFormSchema, type WorkoutFormSchema } from './workout-form-schema';
  import Loader2Icon from '@lucide/svelte/icons/loader-2';
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';

  let { data }: { data: { workoutForm: SuperValidated<Infer<WorkoutFormSchema>> } } = $props();

  let saveError = $state(false);

  const workoutForm = superForm(data.workoutForm, {
    validators: zod4Client(workoutFormSchema),
    dataType: 'json',
    resetForm: false,
    onSubmit: () => {
      saveError = false;
    },
    onUpdate: ({ form: f }) => {
      if (!f.valid) {
        toast.error('Please fix the errors in the form.');
      }
    },
    onUpdated: ({ form: f }) => {
      if (f.valid) {
        toast.success('Workout routine saved successfully');
      }
    },
    onError: () => {
      saveError = true;
    }
  });
  const { form: formData, enhance, submitting } = workoutForm;
</script>

<form class="w-full flex flex-col gap-8" method="POST" action="?/save" use:enhance>
  <div class="flex flex-col gap-4 border rounded-lg p-4">
    <h2 class="text-2xl font-semibold">Basic Info</h2>

    <Form.Field form={workoutForm} name="name">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Workout Routine Name</Form.Label>
          <Input {...props} bind:value={$formData.name} placeholder="My Workout Routine" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field form={workoutForm} name="slug">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Slug</Form.Label>
          <InputGroup.Root>
            <InputGroup.Addon>/{page.data.profile?.username}/routines/</InputGroup.Addon>
            <InputGroup.Input {...props} bind:value={$formData.slug} placeholder="my-workout-routine" />
          </InputGroup.Root>
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field form={workoutForm} name="description">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Description</Form.Label>
          <Textarea {...props} bind:value={$formData.description} placeholder="Enter a brief description of your workout routine" />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
  </div>

  <div class="flex flex-col gap-4 border rounded-lg p-4">
    <h2 class="text-2xl font-semibold">Schedule</h2>

    <Button onclick={() => {
      $formData.workout_days.push({
        workout_exercises: []
      });
      $formData = $formData;
    }}>Add Day</Button>

    <Accordion.Root class="border rounded-lg px-4" type="single" value="0">
      {#each $formData.workout_days as day, index}
        <Accordion.Item value={index.toString()}>
          <Accordion.Trigger class="text-lg">
            Day {index + 1}
          </Accordion.Trigger>
          <Accordion.Content class="flex flex-col gap-4">
            <Button onclick={() => {
              $formData.workout_days[index].workout_exercises.push({
                name: '',
                weight: undefined,
                sets: 4,
                reps: 10,
              });
              $formData = $formData;
            }}>Add Exercise</Button>

            {#if $formData.workout_days[index].workout_exercises.length === 0}
              <p class="text-muted-foreground">No exercises added yet.</p>
            {/if}

            {#each $formData.workout_days[index].workout_exercises as exercise, eIndex}
              <div class="flex flex-col gap-4 border rounded-lg p-4">
                <Form.Field form={workoutForm} name="workout_days[{index}].workout_exercises[{eIndex}].name">
                  <Form.Control>
                    {#snippet children({ props })}
                      <Form.Label>Exercise Name</Form.Label>
                      <Input {...props} placeholder="e.g. Bench Press" bind:value={$formData.workout_days[index].workout_exercises[eIndex].name} />
                    {/snippet}
                  </Form.Control>
                  <Form.FieldErrors />
                </Form.Field>

                <Form.Field form={workoutForm} name="workout_days[{index}].workout_exercises[{eIndex}].weight">
                  <Form.Control>
                    {#snippet children({ props })}
                      <Form.Label>Weight in lbs</Form.Label>
                      <Input {...props} type="number" bind:value={$formData.workout_days[index].workout_exercises[eIndex].weight} />
                    {/snippet}
                  </Form.Control>
                  <Form.FieldErrors />
                </Form.Field>

                <Form.Field form={workoutForm} name="workout_days[{index}].workout_exercises[{eIndex}].sets">
                  <Form.Control>
                    {#snippet children({ props })}
                      <Form.Label>Sets</Form.Label>
                      <Input {...props} type="number" bind:value={$formData.workout_days[index].workout_exercises[eIndex].sets} />
                    {/snippet}
                  </Form.Control>
                  <Form.FieldErrors />
                </Form.Field>

                <Form.Field form={workoutForm} name="workout_days[{index}].workout_exercises[{eIndex}].reps">
                  <Form.Control>
                    {#snippet children({ props })}
                      <Form.Label>Reps</Form.Label>
                      <Input {...props} type="number" bind:value={$formData.workout_days[index].workout_exercises[eIndex].reps} />
                    {/snippet}
                  </Form.Control>
                  <Form.FieldErrors />
                </Form.Field>
              </div>
            {/each}
          </Accordion.Content>
        </Accordion.Item>
      {/each}
    </Accordion.Root>
  </div>

  <Form.Button class="mt-4" disabled={$submitting}>
    {#if $submitting}
      <Loader2Icon class="animate-spin" />
    {/if}
    Save
  </Form.Button>

  {#if saveError}
    <Alert.Root variant="destructive">
      <AlertCircleIcon />
      <Alert.Title>Something went wrong</Alert.Title>
      <Alert.Description>
        We encountered an issue while saving your workout routine. Please try again later.
      </Alert.Description>
    </Alert.Root>
  {/if}
</form>
