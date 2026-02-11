-- Create endpoints table
create table if not exists public.endpoints (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  name text not null,
  url text not null,
  method text not null default 'GET',
  check_interval_seconds int not null default 300,
  timeout_seconds int not null default 10,
  expected_status_code int not null default 200,
  is_active boolean not null default true,
  description text
);

-- Create health check results table
create table if not exists public.health_checks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  endpoint_id uuid not null references public.endpoints(id) on delete cascade,
  status_code int,
  response_time_ms int,
  is_healthy boolean not null,
  error_message text,
  response_size_bytes int
);

-- Create alerts table
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  endpoint_id uuid not null references public.endpoints(id) on delete cascade,
  alert_type text not null,
  threshold_value numeric,
  is_active boolean not null default true,
  trigger_count int not null default 1,
  consecutive_failures int not null default 0
);

-- Create alert history table
create table if not exists public.alert_history (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  alert_id uuid not null references public.alerts(id) on delete cascade,
  triggered_at timestamp with time zone,
  message text,
  resolved_at timestamp with time zone
);

-- Create indexes for better query performance
create index if not exists idx_health_checks_endpoint_id on public.health_checks(endpoint_id);
create index if not exists idx_health_checks_created_at on public.health_checks(created_at desc);
create index if not exists idx_alerts_endpoint_id on public.alerts(endpoint_id);
create index if not exists idx_alert_history_alert_id on public.alert_history(alert_id);
create index if not exists idx_endpoints_is_active on public.endpoints(is_active);

-- Enable RLS on all tables
alter table public.endpoints enable row level security;
alter table public.health_checks enable row level security;
alter table public.alerts enable row level security;
alter table public.alert_history enable row level security;

-- Create RLS policies (public access for monitoring purposes - can be restricted later)
-- Endpoints policies
create policy "Allow public to view endpoints" on public.endpoints for select using (true);
create policy "Allow public to create endpoints" on public.endpoints for insert with check (true);
create policy "Allow public to update endpoints" on public.endpoints for update using (true);
create policy "Allow public to delete endpoints" on public.endpoints for delete using (true);

-- Health checks policies
create policy "Allow public to view health checks" on public.health_checks for select using (true);
create policy "Allow public to create health checks" on public.health_checks for insert with check (true);

-- Alerts policies
create policy "Allow public to view alerts" on public.alerts for select using (true);
create policy "Allow public to create alerts" on public.alerts for insert with check (true);
create policy "Allow public to update alerts" on public.alerts for update using (true);
create policy "Allow public to delete alerts" on public.alerts for delete using (true);

-- Alert history policies
create policy "Allow public to view alert history" on public.alert_history for select using (true);
create policy "Allow public to create alert history" on public.alert_history for insert with check (true);
