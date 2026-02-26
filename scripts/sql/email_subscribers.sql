create table if not exists public.app_email_subscribers (
  email text primary key,
  name text,
  user_email text references public.app_users(email) on delete set null,
  is_active boolean not null default true,
  wants_new_releases boolean not null default true,
  wants_vip_updates boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists app_email_subscribers_active_idx
  on public.app_email_subscribers (is_active, wants_new_releases, wants_vip_updates);

create table if not exists public.app_email_events_log (
  id bigint generated always as identity primary key,
  event_key text not null unique,
  event_type text not null,
  created_at timestamptz not null default now()
);
