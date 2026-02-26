create table if not exists public.app_referral_codes (
  user_email text primary key references public.app_users(email) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.app_referrals (
  id bigint generated always as identity primary key,
  referrer_email text not null references public.app_users(email) on delete cascade,
  referred_email text not null unique references public.app_users(email) on delete cascade,
  referral_code text not null,
  status text not null default 'qualified' check (status in ('qualified', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists app_referrals_referrer_status_idx
  on public.app_referrals (referrer_email, status, created_at desc);

create table if not exists public.app_referral_rewards (
  id bigint generated always as identity primary key,
  user_email text not null references public.app_users(email) on delete cascade,
  milestone int not null check (milestone > 0),
  reward_days int not null default 30 check (reward_days > 0),
  created_at timestamptz not null default now(),
  unique (user_email, milestone)
);

create table if not exists public.app_vip_grants (
  id bigint generated always as identity primary key,
  user_email text not null references public.app_users(email) on delete cascade,
  source text not null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists app_vip_grants_user_email_expires_at_idx
  on public.app_vip_grants (user_email, expires_at desc);
