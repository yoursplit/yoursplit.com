<script lang="ts">
  interface Props {
    title?: string;
  };

  let { title }: Props = $props();
</script>

<svelte:head>
  <title>{title && title + ' - '}YourSplit</title>
  <meta name="description" content="Create, save, and share workout routines" />
</svelte:head>
