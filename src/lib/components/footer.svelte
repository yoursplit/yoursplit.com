<script lang="ts">
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { Button, buttonVariants } from '$lib/components/ui/button';
  import { resetMode, setMode } from 'mode-watcher';
  import SunIcon from '@lucide/svelte/icons/sun';
  import MoonIcon from '@lucide/svelte/icons/moon';
  import GitHubIcon from '$lib/assets/icons/github-icon.svelte';
</script>

<footer class="w-full flex flex-row items-center justify-between gap-8 p-8">
  <div class="flex flex-row items-center gap-4">
    <Button variant="ghost" size="icon" href="https://github.com/yoursplit/yoursplit.com" target="_blank" rel="noopener noreferrer">
      <GitHubIcon />
    </Button>
    <p class="text-sm max-sm:text-center text-muted-foreground">
      Created by
      <a class="font-medium underline underline-offset-4" href="https://olegpolin.com" target="_blank" rel="noopener noreferrer">
        Oleg
      </a>,
      <a class="font-medium underline underline-offset-4" href="https://github.com/bodenharris" target="_blank" rel="noopener noreferrer">
        Boden
      </a> &amp;
      <a class="font-medium underline underline-offset-4" href="https://github.com/lukesantos34" target="_blank" rel="noopener noreferrer">
        Luke
      </a>.
    </p>
  </div>

  <DropdownMenu.Root>
    <DropdownMenu.Trigger class={buttonVariants({ variant: 'outline', size: 'icon' })}>
      <SunIcon class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100" />
      <span class="sr-only">Toggle theme</span>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content align="end">
      <DropdownMenu.Item onclick={() => setMode('light')}>Light</DropdownMenu.Item>
      <DropdownMenu.Item onclick={() => setMode('dark')}>Dark</DropdownMenu.Item>
      <DropdownMenu.Item onclick={() => resetMode()}>System</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
</footer>
