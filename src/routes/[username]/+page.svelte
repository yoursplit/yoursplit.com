<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';
  import type { PageProps } from './$types';
  import Seo from '$lib/components/seo.svelte';
  import { Button, buttonVariants } from '$lib/components/ui/button';
  import * as Dialog from '$lib/components/ui/dialog';
  import { ScrollArea } from '$lib/components/ui/scroll-area';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { Spinner } from '$lib/components/ui/spinner';
  import * as Avatar from '$lib/components/ui/avatar';
  import * as Empty from '$lib/components/ui/empty';
  import WorkoutCard from '$lib/components/workout-card.svelte';
  import UserIcon from '@lucide/svelte/icons/user';

  type FollowProfile = {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };

  let { data }: PageProps = $props();
  let isFollowPending = $state(false);
  let followersDialogOpen = $state(false);
  let followingDialogOpen = $state(false);
  let followers = $state<FollowProfile[] | null>(null);
  let following = $state<FollowProfile[] | null>(null);
  let isFollowersLoading = $state(false);
  let isFollowingLoading = $state(false);
  let followersLoadForm: HTMLFormElement | null = $state(null);
  let followingLoadForm: HTMLFormElement | null = $state(null);

  const enhanceFollow = () => {
    isFollowPending = true;

    return async ({ update }: { update: () => Promise<void> }) => {
      try {
        await update();
      } finally {
        isFollowPending = false;
      }
    };
  };

  const enhanceFollowers: SubmitFunction = ({ cancel }) => {
    if (followers !== null) {
      cancel();
      return;
    }

    isFollowersLoading = true;

    return async ({ result }) => {
      try {
        if (result.type === 'success') {
          const actionData = result.data as { followers?: FollowProfile[] } | null;
          followers = actionData?.followers ?? [];
        } else {
          followers = [];
        }
      } finally {
        isFollowersLoading = false;
      }
    };
  };

  const enhanceFollowing: SubmitFunction = ({ cancel }) => {
    if (following !== null) {
      cancel();
      return;
    }

    isFollowingLoading = true;

    return async ({ result }) => {
      try {
        if (result.type === 'success') {
          const actionData = result.data as { following?: FollowProfile[] } | null;
          following = actionData?.following ?? [];
        } else {
          following = [];
        }
      } finally {
        isFollowingLoading = false;
      }
    };
  };

  const handleFollowersTriggerClick = () => {
    if (!isFollowersLoading && followers === null) {
      followersLoadForm?.requestSubmit();
    }
  };

  const handleFollowingTriggerClick = () => {
    if (!isFollowingLoading && following === null) {
      followingLoadForm?.requestSubmit();
    }
  };
</script>

<Seo title={data.userProfile.username} />

<form bind:this={followersLoadForm} class="hidden" method="POST" action="?/followers" use:enhance={enhanceFollowers}></form>
<form bind:this={followingLoadForm} class="hidden" method="POST" action="?/following" use:enhance={enhanceFollowing}></form>

<div class="flex flex-col gap-10 sm:gap-16 my-auto">
  <div class="flex flex-col md:flex-row gap-10 sm:gap-16">
    <div class="md:basis-1/2 flex flex-col items-center gap-4">
      <Avatar.Root class="size-16">
        <Avatar.Image src={data.userProfile.avatar_url} alt="Profile picture" />
        <Avatar.Fallback>
          <UserIcon />
        </Avatar.Fallback>
      </Avatar.Root>
      <h1 class="text-xl sm:text-2xl text-center font-semibold wrap-break-word">{data.userProfile.full_name}</h1>
      <p class="text-base sm:text-lg text-muted-foreground text-center break-all">@{data.userProfile.username}</p>

      <div class="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
        <Dialog.Root bind:open={followersDialogOpen}>
          <Dialog.Trigger class={`${buttonVariants({ variant: 'ghost' })} h-auto rounded-xl px-4 py-2 flex-col gap-0`} onclick={handleFollowersTriggerClick}>
            <span class="font-semibold">{data.numFollowers}</span>
            <span class="text-muted-foreground">Followers</span>
          </Dialog.Trigger>
          <Dialog.Content class="sm:max-w-md">
            <Dialog.Header>
              <Dialog.Title>Followers</Dialog.Title>
              <Dialog.Description>People who follow @{data.userProfile.username}</Dialog.Description>
            </Dialog.Header>

            <ScrollArea class="h-72 rounded-md border">
              <div class="p-2">
                {#if isFollowersLoading}
                  <div class="space-y-3 p-1">
                    {#each Array.from({ length: 5 }) as _, index (index)}
                      <div class="flex items-center gap-3 rounded-xl px-2 py-1">
                        <Skeleton class="size-8 rounded-full" />
                        <div class="min-w-0 flex-1 space-y-2">
                          <Skeleton class="h-4 w-32" />
                          <Skeleton class="h-3 w-24" />
                        </div>
                      </div>
                    {/each}
                  </div>
                {:else if (followers?.length ?? 0) > 0}
                  <div class="flex flex-col gap-1">
                    {#each followers ?? [] as follower (follower.id)}
                      <a href={`/${follower.username}`} class={`${buttonVariants({ variant: 'ghost' })} h-auto w-full justify-start rounded-xl px-3 py-2`} onclick={() => { followersDialogOpen = false; }}>
                        <Avatar.Root class="size-8">
                          <Avatar.Image src={follower.avatar_url} alt="Profile picture" />
                          <Avatar.Fallback>
                            <UserIcon />
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <span class="min-w-0 text-left">
                          <span class="block truncate font-medium">{follower.full_name ?? follower.username}</span>
                          <span class="block truncate text-muted-foreground text-xs">@{follower.username}</span>
                        </span>
                      </a>
                    {/each}
                  </div>
                {:else}
                  <p class="py-10 text-center text-muted-foreground">No followers yet.</p>
                {/if}
              </div>
            </ScrollArea>
          </Dialog.Content>
        </Dialog.Root>

        <Dialog.Root bind:open={followingDialogOpen}>
          <Dialog.Trigger class={`${buttonVariants({ variant: 'ghost' })} h-auto rounded-xl px-4 py-2 flex-col gap-0`} onclick={handleFollowingTriggerClick}>
            <span class="font-semibold">{data.numFollowing}</span>
            <span class="text-muted-foreground">Following</span>
          </Dialog.Trigger>
          <Dialog.Content class="sm:max-w-md">
            <Dialog.Header>
              <Dialog.Title>Following</Dialog.Title>
              <Dialog.Description>People @{data.userProfile.username} follows</Dialog.Description>
            </Dialog.Header>

            <ScrollArea class="h-72 rounded-md border">
              <div class="p-2">
                {#if isFollowingLoading}
                  <div class="space-y-3 p-1">
                    {#each Array.from({ length: 5 }) as _, index (index)}
                      <div class="flex items-center gap-3 rounded-xl px-2 py-1">
                        <Skeleton class="size-8 rounded-full" />
                        <div class="min-w-0 flex-1 space-y-2">
                          <Skeleton class="h-4 w-32" />
                          <Skeleton class="h-3 w-24" />
                        </div>
                      </div>
                    {/each}
                  </div>
                {:else if (following?.length ?? 0) > 0}
                  <div class="flex flex-col gap-1">
                    {#each following ?? [] as followedProfile (followedProfile.id)}
                      <a href={`/${followedProfile.username}`} class={`${buttonVariants({ variant: 'ghost' })} h-auto w-full justify-start rounded-xl px-3 py-2`} onclick={() => { followingDialogOpen = false; }}>
                        <Avatar.Root class="size-8">
                          <Avatar.Image src={followedProfile.avatar_url} alt="Profile picture" />
                          <Avatar.Fallback>
                            <UserIcon />
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <span class="min-w-0 text-left">
                          <span class="block truncate font-medium">{followedProfile.full_name ?? followedProfile.username}</span>
                          <span class="block truncate text-muted-foreground text-xs">@{followedProfile.username}</span>
                        </span>
                      </a>
                    {/each}
                  </div>
                {:else}
                  <p class="py-10 text-center text-muted-foreground">Not following anyone yet.</p>
                {/if}
              </div>
            </ScrollArea>
          </Dialog.Content>
        </Dialog.Root>
      </div>

      {#if !data.isOwnProfile}
        {#if data.isLoggedIn}
          <form method="POST" action={data.isFollowing ? '?/unfollow' : '?/follow'} use:enhance={enhanceFollow}>
            <Button type="submit" variant={data.isFollowing ? 'outline' : 'default'} disabled={isFollowPending}>
              {#if isFollowPending}
                <Spinner />
                {data.isFollowing ? 'Unfollowing...' : 'Following...'}
              {:else}
                {data.isFollowing ? 'Unfollow' : 'Follow'}
              {/if}
            </Button>
          </form>
        {:else}
          <Button href="/login" variant="outline">
            Log in to follow
          </Button>
        {/if}
      {/if}
    </div>

    <div class="md:basis-1/2 flex flex-col gap-4">
      <h2 class="text-xl text-center md:text-left font-semibold">
        {data.numWorkoutRoutines} Workout {data.numWorkoutRoutines === 1 ? 'Routine' : 'Routines'}
      </h2>

      {#if data.workoutRoutines.length > 0}
        <div class="grid grid-cols-1 gap-4">
          {#each data.workoutRoutines as workoutRoutine}
            <WorkoutCard {...workoutRoutine} />
          {/each}
        </div>
      {:else}
        <Empty.Root>
          <Empty.Header>
            <Empty.Title>No content</Empty.Title>
            <Empty.Description>This user has no content</Empty.Description>
          </Empty.Header>
        </Empty.Root>
      {/if}
    </div>
  </div>

  {#if data.isOwnProfile}
    <div class="flex justify-center">
      <Button href="/account">
        Edit profile
      </Button>
    </div>
  {/if}
</div>
