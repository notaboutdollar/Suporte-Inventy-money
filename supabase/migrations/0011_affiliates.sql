-- CRM de afiliados: modulo novo ao lado de Tickets. Compartilha auth/roles.
-- Aplicar via Supabase SQL Editor.

create type affiliate_status as enum (
  'novo','no_processo','em_negociacao','ativo','fechado','sem_resposta','recusado'
);

create type affiliate_origin as enum (
  'twitter','instagram','tiktok','linkedin','youtube','indicacao','organico','outro'
);

create type affiliate_niche as enum (
  'web3','lifestyle','financas','dev','ia','gastronomia','modelo',
  'comedia','viagens','geopolitica','produtos','outro'
);

create type affiliate_engagement as enum ('alto','medio','baixo');

create type affiliate_event_kind as enum (
  'created','status_change','assigned','comment','edited'
);

create table public.affiliates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  handle text,
  phone text,
  email text,
  state text,
  city text,
  origin affiliate_origin,
  socials jsonb not null default '[]'::jsonb,
  niche affiliate_niche,
  engagement affiliate_engagement,
  status affiliate_status not null default 'novo',
  first_contact_at date,
  last_contact_at date,
  follow_up_at date,
  conversion_trigger text,
  notes text,
  media_kit_url text,
  assignee_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index affiliates_status_idx on public.affiliates(status);
create index affiliates_niche_idx on public.affiliates(niche);
create index affiliates_origin_idx on public.affiliates(origin);
create index affiliates_created_at_idx on public.affiliates(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger affiliates_set_updated_at
  before update on public.affiliates
  for each row execute function public.set_updated_at();

create table public.affiliate_events (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind affiliate_event_kind not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index affiliate_events_affiliate_idx on public.affiliate_events(affiliate_id);
create index affiliate_events_created_at_idx on public.affiliate_events(created_at desc);

alter table public.affiliates enable row level security;
alter table public.affiliate_events enable row level security;

create policy "affiliates select for approved"
  on public.affiliates for select to authenticated
  using (public.is_approved());

create policy "affiliates insert for admin or moderator"
  on public.affiliates for insert to authenticated
  with check (public.is_admin_or_moderator());

create policy "affiliates update for admin or moderator"
  on public.affiliates for update to authenticated
  using (public.is_admin_or_moderator())
  with check (public.is_admin_or_moderator());

create policy "affiliates delete for admin"
  on public.affiliates for delete to authenticated
  using (public.is_admin());

create policy "affiliate events select for approved"
  on public.affiliate_events for select to authenticated
  using (public.is_approved());

create policy "affiliate events insert for admin or moderator"
  on public.affiliate_events for insert to authenticated
  with check (public.is_admin_or_moderator());
