<script lang="ts">
  import Bot from '@lucide/svelte/icons/bot';
  import Send from '@lucide/svelte/icons/send';
  import User from '@lucide/svelte/icons/user';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { ScrollArea } from '$lib/components/ui/scroll-area';
  import Spinner from '$lib/components/ui/spinner/spinner.svelte';

  let { form }: { form: any } = $props();

  // svelte-ignore state_referenced_locally
  let formData = form.form;

  let open = $state(true);

  let messages: { role: 'user' | 'assistant', content: string }[] = $state([
    { role: 'assistant', content: 'Hi! I am an obligatory AI assistant that every web app is adding. Tell me your goals, how many days a week you want to exercise, and I will generate or optimize this workout routine for you!' }
  ]);
  let inputMessage = $state('');
  let isLoading = $state(false);

  async function sendMessage() {
    if (!inputMessage.trim() || isLoading) return;

    messages = [...messages, { role: 'user', content: inputMessage }];
    const currentMessage = inputMessage;
    inputMessage = '';
    isLoading = true;

    try {
      const resp = await fetch('/api/workout-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentMessage,
          currentData: $formData
        })
      });

      if (!resp.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await resp.json();
      
      messages = [...messages, { role: 'assistant', content: result.message }];
      
      // Update form data
      if (result.formData) {
        formData.set({ ...$formData, ...result.formData });
      }
    } catch (error) {
      console.error(error);
      messages = [...messages, { role: 'assistant', content: 'Sorry, I encountered an error while updating your routine.' }];
    } finally {
      isLoading = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
</script>

<div class="flex flex-col bg-card border rounded-xl shadow-sm overflow-hidden {open ? 'h-135 lg:h-[calc(100vh-10rem)]' : ''}">
  <div class="p-4 border-b bg-muted/30">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 font-semibold">
        <Bot class="w-5 h-5 text-primary" />
        AI Assistant
      </div>
      <Button variant="ghost" size="icon" class="h-7 w-7" onclick={() => open = !open}>
        <ChevronDownIcon class="w-4 h-4 transition-transform duration-200 {open ? '' : '-rotate-90'}" />
      </Button>
    </div>
  </div>

  {#if open}
  <ScrollArea class="flex-1 min-h-0 px-4">
    <div class="flex flex-col gap-4 py-4">
      {#each messages as msg}
        <div class="flex gap-2 {msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 {msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}">
            {#if msg.role === 'user'}
              <User class="w-4 h-4" />
            {:else}
              <Bot class="w-4 h-4" />
            {/if}
          </div>
          <div class="max-w-[80%] rounded-lg p-3 text-sm {msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}">
            {msg.content}
          </div>
        </div>
      {/each}
      
      {#if isLoading}
        <div class="flex gap-2">
          <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-muted">
            <Bot class="w-4 h-4" />
          </div>
          <div class="max-w-[80%] rounded-lg p-3 text-sm bg-muted flex items-center gap-2">
            <Spinner class="w-4 h-4" /> Thinking...
          </div>
        </div>
      {/if}
    </div>
  </ScrollArea>

  <div class="p-3 border-t bg-muted/10">
    <form onsubmit={(e) => { e.preventDefault(); sendMessage(); }} class="flex gap-2">
      <Input
        bind:value={inputMessage}
        placeholder="Type a message..."
        onkeydown={handleKeyDown}
        disabled={isLoading}
        class="flex-1"
      />
      <Button type="submit" size="icon" disabled={isLoading || !inputMessage.trim()}>
        <Send class="w-4 h-4" />
      </Button>
    </form>
  </div>
  {/if}
</div>
