-- Run this once in the SQL editor of the production database (project olgvvhjguiwgcfxpdnli).
-- Safe to run more than once. Creates the sign-in log the dashboard's Sign-ins tab reads,
-- so it no longer needs the server admin key.

create table if not exists public.member_activity (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  provider text,
  first_seen_at timestamptz not null default now(),
  last_sign_in_at timestamptz not null default now(),
  sign_in_count integer not null default 1
);

grant select on public.member_activity to authenticated;
grant all on public.member_activity to service_role;

alter table public.member_activity enable row level security;

drop policy if exists "Admins can read member activity" on public.member_activity;
create policy "Admins can read member activity"
on public.member_activity
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Users can read own activity" on public.member_activity;
create policy "Users can read own activity"
on public.member_activity
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.record_sign_in()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_email text;
  v_provider text;
begin
  select u.id, u.email, coalesce(u.raw_app_meta_data->>'provider', 'email')
    into v_id, v_email, v_provider
  from auth.users u
  where u.id = auth.uid();

  if v_id is null then
    return;
  end if;

  insert into public.member_activity (user_id, email, provider, first_seen_at, last_sign_in_at, sign_in_count)
  values (v_id, v_email, v_provider, now(), now(), 1)
  on conflict (user_id) do update
    set email = excluded.email,
        provider = excluded.provider,
        last_sign_in_at = now(),
        sign_in_count = public.member_activity.sign_in_count + 1;
end;
$$;

revoke all on function public.record_sign_in() from public;
grant execute on function public.record_sign_in() to authenticated;

-- Backfill everyone who already has an account, so the tab isn't empty.
insert into public.member_activity (user_id, email, provider, first_seen_at, last_sign_in_at, sign_in_count)
select u.id,
       u.email,
       coalesce(u.raw_app_meta_data->>'provider', 'email'),
       u.created_at,
       coalesce(u.last_sign_in_at, u.created_at),
       1
from auth.users u
on conflict (user_id) do nothing;
