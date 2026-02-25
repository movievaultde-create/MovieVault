create table if not exists public.app_users (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists app_users_email_idx on public.app_users (email);
