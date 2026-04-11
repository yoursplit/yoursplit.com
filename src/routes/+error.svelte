<script lang="ts">
  import { page } from '$app/state';
  import Seo from '$lib/components/seo.svelte';
</script>

<Seo title={`${page.status}`} />

<div class="flex flex-col items-center gap-4 p-16 my-auto">
  <h1 class="text-4xl text-center font-semibold">{page.status}</h1>
  <p class="text-2xl text-center">{page.error?.message}</p>
</div>
