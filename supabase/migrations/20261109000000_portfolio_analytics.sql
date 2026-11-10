-- Dedicated V18 portfolio analytics schema. Run only in a NEW, dedicated Supabase project.
-- No public table access. Edge function is the sole API and uses a secret key server-side.
create table if not exists public.portfolio_events (
  id bigint generated always as identity primary key,
  event_id uuid not null unique,
  occurred_at timestamptz not null default now(),
  event_name text not null check (event_name in ('page_view','resume_download','contact_click','project_open','case_study_open')),
  path text not null check (length(path) between 1 and 140),
  visitor_hash text not null check (length(visitor_hash) = 64),
  referrer_domain text not null default '',
  utm_source text not null default ''
);
create index if not exists portfolio_events_kind_date_idx on public.portfolio_events(event_name, occurred_at desc);
create index if not exists portfolio_events_visitor_date_idx on public.portfolio_events(visitor_hash, occurred_at desc);
create index if not exists portfolio_events_page_idx on public.portfolio_events(path, occurred_at desc);
alter table public.portfolio_events enable row level security;
revoke all on table public.portfolio_events from PUBLIC, anon, authenticated;
revoke all on sequence public.portfolio_events_id_seq from PUBLIC, anon, authenticated;

-- Explicitly private server-only RPC. No EXECUTE for browser roles.
create or replace function public.portfolio_public_count()
returns jsonb language sql stable security invoker set search_path = ''
as $$
  select jsonb_build_object(
    'total_views', (select count(*) from public.portfolio_events where event_name = 'page_view'),
    'profile_views', (select count(*) from public.portfolio_events where event_name = 'page_view' and path = 'about.html')
  );
$$;

create or replace function public.portfolio_owner_stats(lookback_days integer default 30)
returns jsonb language sql stable security invoker set search_path = ''
as $$
with e as materialized (
  select event_name, path, visitor_hash, referrer_domain, utm_source, occurred_at::date as d
  from public.portfolio_events
  where occurred_at >= now() - make_interval(days => least(365, greatest(1, coalesce(lookback_days, 30))))
),
daily as (
  select d, count(*) filter (where event_name = 'page_view') as views
  from e group by d order by d
),
pages as (
  select path, count(*) as views
  from e where event_name = 'page_view'
  group by path order by views desc limit 10
),
sources as (
  select case when utm_source <> '' then utm_source when referrer_domain <> '' then referrer_domain else 'Direct / unknown' end as source,
         count(*) as views
  from e where event_name = 'page_view'
  group by 1 order by views desc limit 8
)
select jsonb_build_object(
  'range_days', least(365, greatest(1, coalesce(lookback_days,30))),
  'page_views', (select count(*) from e where event_name='page_view'),
  'unique_sessions', (select count(distinct visitor_hash) from e where event_name='page_view'),
  'profile_views', (select count(*) from e where event_name='page_view' and path='about.html'),
  'resume_downloads', (select count(*) from e where event_name='resume_download'),
  'contact_clicks', (select count(*) from e where event_name='contact_click'),
  'project_opens', (select count(*) from e where event_name='project_open'),
  'daily', coalesce((select jsonb_agg(jsonb_build_object('day', d, 'views', views) order by d) from daily), '[]'::jsonb),
  'pages', coalesce((select jsonb_agg(jsonb_build_object('path', path, 'views', views)) from pages), '[]'::jsonb),
  'sources', coalesce((select jsonb_agg(jsonb_build_object('source', source, 'views', views)) from sources), '[]'::jsonb)
);
$$;
revoke all on function public.portfolio_public_count() from PUBLIC, anon, authenticated;
revoke all on function public.portfolio_owner_stats(integer) from PUBLIC, anon, authenticated;
grant execute on function public.portfolio_public_count() to service_role;
grant execute on function public.portfolio_owner_stats(integer) to service_role;
grant select, insert on table public.portfolio_events to service_role;
grant usage, select on sequence public.portfolio_events_id_seq to service_role;

comment on table public.portfolio_events is 'First-party aggregate portfolio interaction events; no IP, raw visitor identifier, email, or user-agent stored.';
