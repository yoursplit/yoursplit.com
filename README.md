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

All schema changes are made through **migration files** in `supabase/migrations/`. These are plain SQL, applied in filename order (timestamp prefix), and are the single source of truth for the schema — never change the remote database by hand in the dashboard, or your migrations will drift from what's actually deployed.

The workflow is: write a migration → apply and test it locally → push it to the remote project.

#### 1. Write the migration

Create a new file in `supabase/migrations/` named `<timestamp>_<description>.sql`, where the timestamp is `YYYYMMDDHHMMSS` and sorts after every existing migration (e.g. `20260711000000_expand_reserved_usernames.sql`). Write the SQL directly.

Alternatively, for large or complex changes, you can make them in the local Supabase dashboard first and let the CLI generate the migration from the diff:

```sh
npx supabase db diff -f <description>
```

#### 2. Apply and test locally

Reset the local database to re-run every migration from scratch (plus `seed.sql`). This is how you confirm the migration applies cleanly against a fresh schema:

```sh
npx supabase db reset
```

> Note: `db reset` wipes your **local** data. It never touches the remote project.

If the migration changes tables, columns, or types, regenerate the TypeScript types (not needed for changes that don't affect the schema shape, such as RLS policies or `CHECK` constraints):

```sh
npx supabase gen types typescript --local > src/lib/database.types.ts
```

Then run the app (`npm run dev`) and verify the change end to end.

#### 3. Push to the remote project

Once it works locally, apply the pending migration(s) to your linked Supabase project. `db push` reads the remote migration history and only applies what hasn't run yet — you do **not** need to `db reset` first (that's local only):

```sh
npx supabase db push
```

> Note: Migrations that add or tighten a constraint are re-validated against **existing** rows, so a push can fail on production data that a fresh local database doesn't have. Check the remote data for conflicts before pushing.

#### Working with others' migrations

If you pull changes that include new migration files, apply them to your local database with:

```sh
npx supabase db reset
```

#### Best practices

- **One logical change per migration**, with a descriptive name — small migrations are easier to review and to reason about when something goes wrong.
- **Migrations are forward-only and immutable once pushed.** Don't edit a migration that has already been applied to remote; write a new one that amends it.
- **Always `db reset` locally before `db push`** so you never discover a broken migration in production.
- **Commit the migration and the regenerated `database.types.ts` together** in the same PR.
