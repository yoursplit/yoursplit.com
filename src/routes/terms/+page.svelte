<script lang="ts">
  import Seo from '$lib/components/seo.svelte';
</script>

<Seo title="Terms of Service" />

<div class="relative w-full flex flex-col items-center pt-12 sm:pt-24 pb-12 sm:pb-16 max-w-4xl mx-auto my-auto gap-6 sm:gap-8 text-left px-4">
  <div class="absolute left-1/2 top-[20%] h-80 w-80 sm:h-125 sm:w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px] -z-10"></div>
  
  <div class="w-full text-center flex flex-col items-center mb-8">
    <h1 class="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
      Terms of <span class="text-blue-500">Service</span>
    </h1>
  </div>

  <div class="w-full prose prose-neutral dark:prose-invert max-w-3xl space-y-8 text-muted-foreground font-medium">
    <section>
      <h2 class="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
      <p>
        By logging into YourSplit using your <strong>Google Account</strong>, you agree to these basic terms. If you do not agree with them, please do not use the service.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-bold text-foreground mb-4">2. Account Responsibility</h2>
      <p>
        Because we strictly use Google login, you are responsible for maintaining the security of your own Google Account. We are not liable for any unauthorized access to your routines if your primary Google Account is compromised.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-bold text-foreground mb-4">3. User Content</h2>
      <p>
        You retain full ownership over any workout routines you create. However, by publishing a routine publicly on the platform, you grant us a non-exclusive license to display it to other users. We reserve the right to remove any content that is wildly inappropriate or malicious.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-bold text-foreground mb-4">4. "As Is" Service</h2>
      <p>
        YourSplit is provided on an "as is" and "as available" basis. While we strive to make it reliable, we do not warrant that the service will be entirely uninterrupted or completely error-free.
      </p>
    </section>
  </div>
</div>
