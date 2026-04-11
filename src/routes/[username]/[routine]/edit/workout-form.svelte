<script lang="ts">
  import { page } from '$app/state';
  import * as Form from '$lib/components/ui/form';
  import { Input } from '$lib/components/ui/input';
  import * as InputGroup from '$lib/components/ui/input-group';
  import { Textarea } from '$lib/components/ui/textarea';
  import * as Alert from '$lib/components/ui/alert';
  import * as AlertDialog from '$lib/components/ui/alert-dialog';
  import * as Accordion from '$lib/components/ui/accordion';
  import { Accordion as AccordionPrimitive } from 'bits-ui';
  import { Button, buttonVariants } from '$lib/components/ui/button';
  import { toast } from 'svelte-sonner';
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import type { PageData } from './$types';
  import { workoutFormSchema, type WorkoutFormSchema } from './workout-form-schema';
  import Loader2Icon from '@lucide/svelte/icons/loader-2';
  import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import Trash2Icon from '@lucide/svelte/icons/trash-2';

  let { data }: { data: PageData & { workoutForm: SuperValidated<Infer<WorkoutFormSchema>> } } = $props();

  let saveError = $state(false);
  let deleteRoutineDialogOpen = $state(false);
  let deleteDialogOpen = $state<boolean[]>([]);
  let deleteExerciseDialogOpen = $state<Record<string, boolean>>({});
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const slugify = (value: string) => value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  const getDayTitle = (index: number, usesNumberedDays: boolean) => {
    if (usesNumberedDays) {
      return `Day ${index + 1}`;
    }

    return weekdays[index % weekdays.length];
  };

  const setDeleteDialogOpen = (index: number, open: boolean) => {
    deleteDialogOpen[index] = open;
    deleteDialogOpen = deleteDialogOpen;
  };

  const getExerciseDialogKey = (dayIndex: number, exerciseIndex: number) => `${dayIndex}-${exerciseIndex}`;

  const setDeleteExerciseDialogOpen = (dayIndex: number, exerciseIndex: number, open: boolean) => {
    const key = getExerciseDialogKey(dayIndex, exerciseIndex);
    deleteExerciseDialogOpen = {
      ...deleteExerciseDialogOpen,
      [key]: open,
    };
  };

  const markDayForDeletion = (index: number) => {
    const dayId = $formData.workout_days[index]?.id;
    if (dayId) {
      $formData.deleted_day_ids.push(dayId);
    }
    $formData.workout_days.splice(index, 1);
    $formData = $formData;
    setDeleteDialogOpen(index, false);
  };

  const markExerciseForDeletion = (dayIndex: number, exerciseIndex: number) => {
    $formData.workout_days[dayIndex].workout_exercises.splice(exerciseIndex, 1);
    $formData = $formData;
    setDeleteExerciseDialogOpen(dayIndex, exerciseIndex, false);
  };

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
    onResult: ({ result }) => {
      if (result.type === 'redirect') {
        toast.success('Workout routine saved successfully');
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

<form class="w-full flex flex-col gap-6 sm:gap-8" method="POST" action="?/save" use:enhance>
  <div class="flex flex-col gap-4 border rounded-lg p-3 sm:p-4">
    <h2 class="text-xl sm:text-2xl font-semibold">Basic Info</h2>

    <Form.Field form={workoutForm} name="name">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Workout Routine Name</Form.Label>
          <Input
            {...props}
            bind:value={$formData.name}
            placeholder="My Workout Routine"
            oninput={(event) => {
              $formData.slug = slugify((event.currentTarget as HTMLInputElement).value);
              $formData = $formData;
            }}
          />
        {/snippet}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field form={workoutForm} name="slug">
      <Form.Control>
        {#snippet children({ props })}
          <Form.Label>Slug</Form.Label>
          <InputGroup.Root class="h-auto min-h-9 flex-wrap sm:flex-nowrap rounded-2xl sm:rounded-4xl">
            <InputGroup.Addon class="max-w-32 sm:max-w-none truncate text-base md:text-sm">/{page.data.profile?.username}/</InputGroup.Addon>
            <InputGroup.Input class="min-w-0" {...props} bind:value={$formData.slug} placeholder="my-workout-routine" />
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

  <div class="flex flex-col gap-4 border rounded-lg p-3 sm:p-4">
    <h2 class="text-xl sm:text-2xl font-semibold">Schedule</h2>

    <Button
      class="w-full sm:w-fit"
      onclick={() => {
        $formData.uses_numbered_days = !$formData.uses_numbered_days;
        $formData = $formData;
      }}
    >
      {$formData.uses_numbered_days ? 'Use Weekdays' : 'Use Numbers'}
    </Button>

    <Button class="w-full sm:w-fit" onclick={() => {
      $formData.workout_days.push({
        day_focus: undefined,
        marked_for_deletion: false,
        workout_exercises: []
      });
      $formData = $formData;
    }}>Add Day</Button>

    <Accordion.Root class="border rounded-lg bg-background" type="single" value="0">
      {#each $formData.workout_days as day, index}
        <Accordion.Item value={index.toString()} class="border-b last:border-b-0">
          <AccordionPrimitive.Header level={3} class="flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-2 px-3 sm:px-4 hover:bg-muted/30 transition-colors">
            <AccordionPrimitive.Trigger
              class="focus-visible:border-ring focus-visible:ring-ring/50 min-w-0 flex flex-1 items-center gap-2 rounded-md py-3 sm:py-4 pr-1 text-left text-sm sm:text-base font-medium outline-none transition-all focus-visible:ring-[3px] [&[data-state=open]>svg]:rotate-180 hover:no-underline"
            >
              <ChevronDownIcon
                class="text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200"
              />
              <span class="min-w-0 wrap-break-word">
                {getDayTitle(index, $formData.uses_numbered_days)}
                {#if day.day_focus?.trim()}
                  <span class="text-xs sm:text-sm text-muted-foreground wrap-break-word">{' - '}{day.day_focus}</span>
                {/if}
              </span>
            </AccordionPrimitive.Trigger>

            <AlertDialog.Root
              open={deleteDialogOpen[index] ?? false}
              onOpenChange={(open) => setDeleteDialogOpen(index, open)}
            >
              <AlertDialog.Trigger
                type="button"
                class="focus-visible:border-ring focus-visible:ring-ring/50 hover:bg-destructive/10 text-destructive inline-flex shrink-0 h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium outline-none transition-all focus-visible:ring-[3px]"
                aria-label={`Delete ${getDayTitle(index, $formData.uses_numbered_days)}`}
              >
                <Trash2Icon class="size-4" />
                <span class="hidden sm:inline">Delete</span>
              </AlertDialog.Trigger>
              <AlertDialog.Content>
                <AlertDialog.Header>
                  <AlertDialog.Title>Delete {getDayTitle(index, $formData.uses_numbered_days)}?</AlertDialog.Title>
                  <AlertDialog.Description>
                    This day will be removed when you save the workout routine.
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                  <AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
                  <AlertDialog.Action
                    type="button"
                    variant="destructive"
                    onclick={() => {
                      markDayForDeletion(index);
                    }}
                  >
                    Delete
                  </AlertDialog.Action>
                </AlertDialog.Footer>
              </AlertDialog.Content>
            </AlertDialog.Root>
          </AccordionPrimitive.Header>

          <Accordion.Content class="flex flex-col gap-4 px-0 pb-4 pt-2">
            <Form.Field form={workoutForm} name="workout_days[{index}].day_focus">
              <Form.Control>
                {#snippet children({ props })}
                  <Form.Label>Daily Focus</Form.Label>
                  <Input {...props} placeholder="e.g. Push, Pull, Legs" bind:value={$formData.workout_days[index].day_focus} />
                {/snippet}
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <Button class="w-full sm:w-fit" onclick={() => {
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
              <div class="relative flex flex-col gap-4 border rounded-lg p-3 sm:p-4">
                <AlertDialog.Root
                  open={deleteExerciseDialogOpen[getExerciseDialogKey(index, eIndex)] ?? false}
                  onOpenChange={(open) => setDeleteExerciseDialogOpen(index, eIndex, open)}
                >
                  <AlertDialog.Trigger
                    type="button"
                    class="absolute right-3 top-3 text-destructive hover:bg-destructive/10 rounded-md p-1 transition-colors"
                    aria-label={`Delete ${exercise.name?.trim() || 'exercise'}`}
                  >
                    <Trash2Icon class="size-4" />
                  </AlertDialog.Trigger>
                  <AlertDialog.Content>
                    <AlertDialog.Header>
                      <AlertDialog.Title>Delete this exercise?</AlertDialog.Title>
                      <AlertDialog.Description>
                        This exercise will be removed when you save the workout routine.
                      </AlertDialog.Description>
                    </AlertDialog.Header>
                    <AlertDialog.Footer>
                      <AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
                      <AlertDialog.Action
                        type="button"
                        variant="destructive"
                        onclick={() => {
                          markExerciseForDeletion(index, eIndex);
                        }}
                      >
                        Delete
                      </AlertDialog.Action>
                    </AlertDialog.Footer>
                  </AlertDialog.Content>
                </AlertDialog.Root>

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

  <Form.Button class="mt-4 w-full sm:w-fit" disabled={$submitting}>
    {#if $submitting}
      <Loader2Icon class="animate-spin" />
    {/if}
    Save
  </Form.Button>

  <AlertDialog.Root
    open={deleteRoutineDialogOpen}
    onOpenChange={(open) => {
      deleteRoutineDialogOpen = open;
    }}
  >
    <AlertDialog.Trigger type="button" class={['w-full sm:w-fit', buttonVariants({ variant: 'destructive' })]}>
      Delete Routine
    </AlertDialog.Trigger>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Delete this routine?</AlertDialog.Title>
        <AlertDialog.Description>
          This action cannot be undone. Your routine and all of its days and exercises will be permanently deleted.
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel type="button">Cancel</AlertDialog.Cancel>
        <form method="POST" action="?/delete">
          <AlertDialog.Action type="submit" variant="destructive">
            Delete Routine
          </AlertDialog.Action>
        </form>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>

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
