alter table public.app_referrals
  add column if not exists ip_hash text,
  add column if not exists device_hash text,
  add column if not exists user_agent_hash text,
  add column if not exists rejection_reason text;

create index if not exists app_referrals_device_hash_idx
  on public.app_referrals (device_hash, created_at desc);

create index if not exists app_referrals_ip_hash_idx
  on public.app_referrals (ip_hash, created_at desc);

create index if not exists app_referrals_rejection_reason_idx
  on public.app_referrals (rejection_reason, created_at desc);
