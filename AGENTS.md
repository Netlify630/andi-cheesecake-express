<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Pinned backend configuration (do not change)

The production backend is Supabase project `olgvvhjguiwgcfxpdnli`. Google OAuth
credentials live in that project's auth settings.

Three places pin it — never remove or "clean up" any of them:

- `vite.config.ts` → `define` block: hardcodes `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` into the client bundle.
- `.env.production`: same values for production builds.
- `src/lib/supabase-env-guard.ts` (imported by `src/server.ts`): rewrites
  server-side `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` at boot if anything
  injects a different project.

`.env` and `supabase/config.toml` are editor-generated and may point elsewhere;
they are overridden by the above and `.env` is gitignored. Visual/text edits must
never touch auth files (`src/lib/google-auth.ts`, `src/routes/auth.tsx` logic,
`src/integrations/supabase/*`).
