<script lang="ts">
  import type { PageProps } from './$types';
  import LoginForm from './login-form.svelte';

  let { data }: PageProps = $props();
</script>

<div class="flex flex-col items-center gap-6 sm:gap-8 my-auto w-full px-2">
  <h1 class="text-3xl sm:text-4xl text-center font-semibold">Log in</h1>

  <div class="w-full max-w-72">
    <LoginForm {data} />
  </div>
</div>
