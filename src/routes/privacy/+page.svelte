<script lang="ts">
  import Seo from '$lib/components/seo.svelte';
</script>

<Seo title="Privacy Policy" />

<div class="relative w-full flex flex-col items-center pt-12 sm:pt-24 pb-12 sm:pb-16 max-w-4xl mx-auto my-auto gap-6 sm:gap-8 text-left px-4">
  <div class="absolute left-1/2 top-[20%] h-80 w-80 sm:h-125 sm:w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px] -z-10"></div>
  
  <div class="w-full text-center flex flex-col items-center mb-8">
    <h1 class="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
      Privacy <span class="text-blue-500">Policy</span>
    </h1>
  </div>

  <div class="w-full prose prose-neutral dark:prose-invert max-w-3xl space-y-8 text-muted-foreground font-medium">
    <section>
      <h2 class="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
      <p>
        We keep it as simple as possible. The only personal information we collect is from your <strong>Google Account</strong> when you log in. This includes your email address, name, and profile picture provided by Google.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
      <p>
        We use this information exclusively to:
      </p>
      <ul class="list-disc pl-6 mt-2 space-y-2">
        <li>Authenticate your identity securely.</li>
        <li>Associate your custom workout routines with your specific profile.</li>
        <li>Display your name or avatar next to routines you choose to share publicly.</li>
      </ul>
    </section>

    <section>
      <h2 class="text-2xl font-bold text-foreground mb-4">3. Data Sharing and Protection</h2>
      <p>
        <strong>We do not sell, rent, or share your personal data with third parties.</strong> Your data is structurally secured and used solely for the necessary functionality of YourSplit. Since we rely on Google for authentication, your passwords are never seen or stored by us.
      </p>
    </section>

    <section>
      <h2 class="text-2xl font-bold text-foreground mb-4">4. Your Rights</h2>
      <p>
        You hold the right to delete your account and all associated workout routines from our database at any time. Simply sign out and reach out to us if you need full data removal.
      </p>
    </section>
  </div>
</div>
