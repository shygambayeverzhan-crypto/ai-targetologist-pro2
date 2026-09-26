-- Run this once in Supabase: Project -> SQL Editor -> New query -> Run.

create table if not exists clients (
  id text primary key,
  plan text not null default 'FREE',
  gen_used int not null default 0,
  an_used int not null default 0,
  fn_used int not null default 0,
  cons_used int not null default 0,
  pro_used int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  plan text not null,
  price numeric,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create index if not exists idx_requests_status on requests(status);
create index if not exists idx_requests_client on requests(client_id);

-- Row Level Security stays OFF here on purpose: the backend talks to
-- Supabase with the service_role key (server-side only), which bypasses
-- RLS anyway. Nothing in the browser ever touches Supabase directly.
