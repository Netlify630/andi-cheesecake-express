-- Run once on the live database so votes record who cast them.
alter table public.flavor_votes add column if not exists user_id uuid;
alter table public.flavor_votes add column if not exists voter_email text;
grant select, insert on public.flavor_votes to anon, authenticated;
notify pgrst, 'reload schema';
