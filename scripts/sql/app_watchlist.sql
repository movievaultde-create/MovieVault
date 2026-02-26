create table if not exists public.app_watchlist (
  id bigint generated always as identity primary key,
  user_email text not null references public.app_users(email) on delete cascade,
  media_id bigint not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster text,
  rating text not null default '0.0',
  year text not null default '',
  added_at timestamptz not null default now(),
  unique (user_email, media_id, media_type)
);

create index if not exists app_watchlist_user_email_idx
  on public.app_watchlist (user_email, added_at desc);
