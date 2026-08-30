# AGENTS.md

Guidance for AI coding agents working in this repository.

## Tech Stack

Refer to the README for the tech stack used in this project, and keep it updated if you add or remove dependencies.

## Agent Tooling

- You have access to the **Svelte MCP server** — use it for up-to-date Svelte 5 / SvelteKit docs and to validate generated Svelte code.
- You have access to the **shadcn-svelte skills** — use them when adding or working with UI components.
- If any of these aren't available in your environment, prompt the user to install them before falling back to memory.

## Use Current Docs

Several parts of this stack evolve quickly and training data is often stale — when unsure about an API, check the official docs instead of guessing.

## Design

- UI is built with **shadcn-svelte**. Add components as needed.
- All design tokens live in `src/routes/layout.css`.
- Don't hardcode colors in components, use the theme variables instead and add new ones if needed.
- Every color variable should be defined in both light and dark mode.
- Make sure any UI you build is fully responsive, and looks good in both light and dark mode.

## Database

- The postgres database along with auth is hosted on **Supabase**.
- For local supabase development, refer to the README for instructions on starting the local dev environment.

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

## Git Commits & Branches

- Do **not** add the coding agent as a co-author on commits — no `Co-Authored-By` trailers, "Generated with" lines, or similar AI attribution in commit messages.
- No AI attribution in branch names either — don't prefix branches with `ai/`, `agent/`, or similar. Name branches after the change using conventional naming conventions.
- The same applies to PR titles and descriptions: describe the change, not the tool that made it.
- Write concise, conventional commit messages describing the change itself.
- Any non-trivial change — features, refactors, anything spanning multiple files or commits — goes on a feature branch with a PR; never push directly to `main`. Only trivial fixes may go to `main`, and only if explicitly asked.
- If you push more changes to a branch after its PR is opened, update the PR description so it still reflects the full change set.

## Keeping This File Updated

Treat AGENTS.md as living documentation. If a change you make invalidates anything here — new commands or scripts, moved directories, changed conventions, added dependencies or bindings — update this file in the same commit.
