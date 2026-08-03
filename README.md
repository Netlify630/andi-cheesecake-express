# Andielicious Cheesecake

TanStack Start (React 19 + Vite 7) app with a Supabase backend.

## Deploying to Vercel (fully portable)

This project has **no runtime dependency on Lovable-hosted assets or services**:
images are bundled from `src/assets/`, the social preview and favicon live in
`public/`, and Google sign-in uses native Supabase OAuth.

1. Push the repo to GitHub and import it in Vercel.
2. Set the build target so the server output matches Vercel:
   - Environment variable: `NITRO_PRESET=vercel`
   - Build command: `npm run build` (or `bun run build`)
3. Add the environment variables from [`.env.example`](./.env.example) in
   Vercel → Settings → Environment Variables.
4. In your Supabase project → Authentication → URL Configuration, add your
   Vercel/production URLs to **Site URL** and **Redirect URLs**.
5. In Supabase → Authentication → Providers → Google, paste your Google Cloud
   OAuth **Client ID + Client Secret**, and in Google Cloud add
   `https://YOUR-PROJECT.supabase.co/auth/v1/callback` as an authorized
   redirect URI.

## Database

All schema lives in [`supabase/migrations`](./supabase/migrations). Against any
Supabase project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The Supabase project itself is the only external service — it can be your own
Supabase org, or self-hosted Supabase, using the same env vars.

## Local development

```bash
bun install
cp .env.example .env   # fill in your Supabase values
bun run dev
```
