create table if not exists public.app_push_subscriptions (
  id bigint generated always as identity primary key,
  user_email text not null references public.app_users(email) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  language text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_email, endpoint)
);

create index if not exists app_push_subscriptions_user_email_idx
  on public.app_push_subscriptions (user_email, is_active);

create table if not exists public.app_notify_series_follows (
  id bigint generated always as identity primary key,
  user_email text not null references public.app_users(email) on delete cascade,
  tv_id bigint not null,
  title text not null,
  created_at timestamptz not null default now(),
  unique (user_email, tv_id)
);

create index if not exists app_notify_series_follows_tv_id_idx
  on public.app_notify_series_follows (tv_id, created_at desc);

create table if not exists public.app_notify_movie_alerts (
  id bigint generated always as identity primary key,
  user_email text not null references public.app_users(email) on delete cascade,
  movie_id bigint not null,
  title text not null,
  created_at timestamptz not null default now(),
  unique (user_email, movie_id)
);

create index if not exists app_notify_movie_alerts_movie_id_idx
  on public.app_notify_movie_alerts (movie_id, created_at desc);

create table if not exists public.app_notify_events_log (
  id bigint generated always as identity primary key,
  user_email text not null references public.app_users(email) on delete cascade,
  event_key text not null,
  event_type text not null,
  created_at timestamptz not null default now(),
  unique (user_email, event_key)
);
