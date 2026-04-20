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

To stop the Supabase development environment, run:

```sh
npx supabase stop
```

To stop the Supabase development environment and remove all data, run:

```sh
npx supabase stop --no-backup
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Deploying

### Create a Supabase project

If you want to deploy your own instance of the app, first create a project on [Supabase](https://supabase.com).

Go to Project Settings > General and copy the Project ID.

### Push the database schema

Log in to the Supabase CLI:

```sh
npx supabase login
```

Link your local project to your Supabase project:

```sh
npx supabase link --project-ref <your-project-id>
```

Push the database schema to your Supabase project:

```sh
npx supabase db push
```

### Production environment variables

In your Supabase project, from the Project Overview page, under the name, click Copy > Project URL.
Under Project Settings > API Keys page, copy the publishable key.

Get the `GROQ_API_KEY` from [Groq Console](https://console.groq.com/keys).

### Deployment

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

Deploy your app to your target environment (e.g. [Cloudflare Workers](https://workers.cloudflare.com)) with the appropriate environment variables set.

### Notes

Don't forget to update the Site URL in your Supabase project under Authentication > URL Configuration to match the URL of your deployed app.

To set up Google OAuth, follow the instructions in the [Supabase documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)

### Making changes to the database

After making changes to your database using the local Supabase dashboard, you can generate a migration file with:

```sh
npx supabase db diff -f <migration-name>
```

Then, regenerate the types with:

```sh
npx supabase gen types typescript --local > src/lib/database.types.ts
```

Finally, push the migration to your Supabase project with:

```sh
npx supabase db push
```

If you pull changes that include new migrations, run the following command to apply them to your local database:

```sh
npx supabase db reset
```
