<script lang="ts">
  import { page } from '$app/state';
  import * as NavigationMenu from '$lib/components/ui/navigation-menu';
  import { navigationMenuTriggerStyle } from '$lib/components/ui/navigation-menu/navigation-menu-trigger.svelte';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as Avatar from '$lib/components/ui/avatar';
  import * as Sheet from '$lib/components/ui/sheet';
  import { Button, buttonVariants } from '$lib/components/ui/button';
  import ProfileCard from '$lib/components/profile-card.svelte';
  import favicon from '$lib/assets/favicon.svg';
  import MenuIcon from '@lucide/svelte/icons/menu';
  import UserIcon from '@lucide/svelte/icons/user';

  const navMenuLinks = [
    {
      title: 'Browse',
      href: '/browse'
    },
    {
      title: 'Create Routine',
      href: '/new'
    }
  ];

  let accountMenuLinks = $derived([
    {
      title: 'Profile',
      href: `/${page.data.profile?.username ?? 'account'}`
    },
    {
      title: 'Account Settings',
      href: '/account'
    }
  ]);
</script>

<header class="w-full flex flex-row items-center justify-between gap-4 py-4 px-2">
  <a class="flex items-center gap-3" href="/">
    <div class="rounded-lg flex items-center justify-center overflow-hidden">
      <img src={favicon} alt="YourSplit logo" class="h-8 w-8" />
    </div>
    <span class="text-2xl font-bold tracking-tight text-foreground">
      YourSplit
    </span>
  </a>

  <div class="flex items-center gap-4">
    <Button variant="outline" class="hidden md:flex rounded-xl" href="/browse">
      Browse
    </Button>
    <Button class="hidden md:flex rounded-xl" href="/new">
      Create Routine
    </Button>

    {#if !page.data.session}
      <Button class="max-md:hidden rounded-xl" href="/login" variant="secondary">
        Log in
      </Button>
    {:else}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger class="max-md:hidden">
          <Avatar.Root class="h-10 w-10 border border-border">
            <Avatar.Image src={page.data.profile?.avatar_url} alt="Profile picture" />
            <Avatar.Fallback class="bg-muted"><UserIcon class="h-5 w-5 text-muted-foreground" /></Avatar.Fallback>
          </Avatar.Root>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          <DropdownMenu.Group>
            <DropdownMenu.Label>
              <ProfileCard class="p-0" profile={page.data.profile} />
            </DropdownMenu.Label>
            <DropdownMenu.Separator />
            {#each accountMenuLinks as link}
              <a href={link.href}>
                <DropdownMenu.Item>{link.title}</DropdownMenu.Item>
              </a>
            {/each}
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {/if}

    <Sheet.Root>
      <Sheet.Trigger class="md:hidden">
        <MenuIcon />
      </Sheet.Trigger>
      <Sheet.Content>
        <nav class="h-full p-2">
          <ul class="h-full flex flex-col justify-center gap-4">
            {#each navMenuLinks as link}
              <li>
                <a href={link.href}>
                  <Sheet.Close
                    class={['w-full justify-start', buttonVariants({ variant: 'ghost' })]}
                  >
                    {link.title}
                  </Sheet.Close>
                </a>
              </li>
            {/each}

            {#if !page.data.session}
              <li>
                <a href="/login">
                  <Sheet.Close
                    class={['w-full justify-start', buttonVariants({ variant: 'ghost' })]}
                  >
                    Log in
                  </Sheet.Close>
                </a>
              </li>
            {:else}
              <ProfileCard profile={page.data.profile} />
              {#each accountMenuLinks as link}
                <li>
                  <a href={link.href}>
                    <Sheet.Close
                      class={['w-full justify-start', buttonVariants({ variant: 'ghost' })]}
                    >
                      {link.title}
                    </Sheet.Close>
                  </a>
                </li>
              {/each}
            {/if}
          </ul>
        </nav>
      </Sheet.Content>
    </Sheet.Root>
  </div>
</header>
