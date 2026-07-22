
-- ============ ROLES ============
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

-- Auto-grant admin to the owner's verified email
create or replace function public.grant_owner_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null
     and lower(new.email) = 'andieliciouscheesecake@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_grant_owner
after insert on auth.users
for each row execute function public.grant_owner_admin();

create trigger on_auth_user_confirmed_grant_owner
after update of email_confirmed_at on auth.users
for each row
when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
execute function public.grant_owner_admin();

-- ============ FLAVORS ============
create table public.flavors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  image_url text,
  category text not null check (category in ('staple','weekly','vote_option')),
  week_label text,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update, delete on public.flavors to authenticated;
grant select on public.flavors to anon;
grant all on public.flavors to service_role;

alter table public.flavors enable row level security;

create policy "Anyone can view active flavors"
  on public.flavors for select
  to anon, authenticated
  using (active = true);

create policy "Admins can view all flavors"
  on public.flavors for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert flavors"
  on public.flavors for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update flavors"
  on public.flavors for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete flavors"
  on public.flavors for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger flavors_updated_at
before update on public.flavors
for each row execute function public.set_updated_at();

-- Seed staples + current weekly flavor from existing site content
insert into public.flavors (slug, name, description, category, position) values
  ('classic-vanilla', 'Classic Vanilla Bean', 'Our signature. Madagascar vanilla, graham crust, silky New York style.', 'staple', 1),
  ('chocolate-ganache', 'Chocolate Ganache', 'Deep cocoa cheesecake under a mirror-glass layer of dark chocolate ganache.', 'staple', 2),
  ('strawberry-compote', 'Strawberry Compote', 'Cream cheese kissed with slow-roasted strawberries and a whisper of vanilla.', 'weekly', 3);

insert into public.flavors (slug, name, description, category, position) values
  ('biscoff', 'Biscoff Cookie Butter', '', 'vote_option', 1),
  ('lemon-blueberry', 'Lemon Blueberry', '', 'vote_option', 2),
  ('salted-caramel', 'Salted Caramel', '', 'vote_option', 3),
  ('pumpkin-spice', 'Pumpkin Spice', '', 'vote_option', 4),
  ('raspberry-swirl', 'Raspberry Swirl', '', 'vote_option', 5),
  ('peanut-butter', 'Peanut Butter Cup', '', 'vote_option', 6);

-- ============ NEWSLETTER SUBSCRIBERS ============
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

grant select, insert, delete on public.newsletter_subscribers to authenticated;
grant insert on public.newsletter_subscribers to anon;
grant all on public.newsletter_subscribers to service_role;

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone can subscribe"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

create policy "Admins can view subscribers"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete subscribers"
  on public.newsletter_subscribers for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- ============ PAGE VIEWS ============
create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  created_at timestamptz not null default now()
);

create index page_views_created_at_idx on public.page_views (created_at desc);
create index page_views_path_idx on public.page_views (path);

grant insert on public.page_views to anon, authenticated;
grant select on public.page_views to authenticated;
grant all on public.page_views to service_role;

alter table public.page_views enable row level security;

create policy "Anyone can record a view"
  on public.page_views for insert
  to anon, authenticated
  with check (true);

create policy "Admins can read views"
  on public.page_views for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
