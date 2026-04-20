# [yoursplit.com](https://yoursplit.com)

Create, save, and share workout routines.

## Tech stack

- [Svelte](https://svelte.dev)
- [SvelteKit](https://svelte.dev/docs/kit)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn-svelte](https://www.shadcn-svelte.com)
- [Supabase](https://supabase.com)
- [Cloudflare Workers](https://workers.cloudflare.com)

## Developing

### Prerequisites

- [Node.js](https://nodejs.org/en/download) (latest LTS version recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (latest version recommended)

### Installing dependencies

Install dependencies with

```sh
npm install
```

### Starting the development server

#### Supabase dev environment

To start the Supabase development environment, run:

```sh
npx supabase start
```

You can view the local Supabase dashboard at [http://127.0.0.1:54323](http://127.0.0.1:54323)

#### Environment variables

Create a `.env` file in the root of your project using the provided `.env.example` as a template.

After starting the Supabase development environment, it will print out your local credentials. Update the `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY` variables in your `.env` file with the corresponding values.

Update the `GROQ_API_KEY` variable in your `.env` file with your [Groq API key](https://console.groq.com/keys).

#### SvelteKit dev server

To start the SvelteKit development server, run:

```sh
npm run dev
```

You can view your app at [http://localhost:5173](http://localhost:5173)

#### Notes

To sign in in the development environment, create a user in the local Supabase dashboard and go to [http://localhost:5173/login/dev](http://localhost:5173/login/dev)

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
