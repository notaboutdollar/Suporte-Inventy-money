-- Schema inicial: profiles, tickets, ticket_attachments, ticket_events
-- Aplicar via Supabase SQL Editor (Dashboard → SQL → paste → Run).

-- Enums
create type profile_role as enum ('admin', 'agent');
create type ticket_category as enum ('top_up', 'bonus', 'cartao', 'cadastro', 'kyc', 'conta_restrita', 'outro');
create type ticket_status as enum ('solicitado', 'em_andamento', 'aguardando_cliente', 'resolvido', 'fechado');
create type ticket_event_kind as enum ('created', 'status_change', 'assigned', 'comment');

-- Tables
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role profile_role not null default 'agent',
  created_at timestamptz not null default now()
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  telegram_handle text,
  email text,
  category ticket_category not null,
  description text not null,
  extra_data jsonb not null default '{}'::jsonb,
  status ticket_status not null default 'solicitado',
  assignee_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tickets_status_idx on public.tickets(status);
create index tickets_assignee_idx on public.tickets(assignee_id);
create index tickets_created_at_idx on public.tickets(created_at desc);

create table public.ticket_attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  mime text,
  size bigint,
  created_at timestamptz not null default now()
);

create index ticket_attachments_ticket_idx on public.ticket_attachments(ticket_id);

create table public.ticket_events (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind ticket_event_kind not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index ticket_events_ticket_idx on public.ticket_events(ticket_id, created_at desc);

-- Trigger: mantém tickets.updated_at atualizado
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tickets_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

-- Trigger: cria profile automático ao criar auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'agent'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket privado pros anexos
insert into storage.buckets (id, name, public)
values ('ticket-attachments', 'ticket-attachments', false)
on conflict (id) do nothing;

-- RLS
alter table public.profiles enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_attachments enable row level security;
alter table public.ticket_events enable row level security;

-- profiles: authenticated read all, update own
create policy "profiles select for authenticated"
  on public.profiles for select to authenticated using (true);

create policy "profiles update own"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- tickets: authenticated read/write, delete admin-only
create policy "tickets select for authenticated"
  on public.tickets for select to authenticated using (true);

create policy "tickets insert for authenticated"
  on public.tickets for insert to authenticated with check (true);

create policy "tickets update for authenticated"
  on public.tickets for update to authenticated using (true) with check (true);

create policy "tickets delete for admin"
  on public.tickets for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ticket_attachments: authenticated read/write/delete
create policy "attachments select for authenticated"
  on public.ticket_attachments for select to authenticated using (true);

create policy "attachments insert for authenticated"
  on public.ticket_attachments for insert to authenticated with check (true);

create policy "attachments delete for authenticated"
  on public.ticket_attachments for delete to authenticated using (true);

-- ticket_events: append-only (insert + select)
create policy "events select for authenticated"
  on public.ticket_events for select to authenticated using (true);

create policy "events insert for authenticated"
  on public.ticket_events for insert to authenticated with check (true);

-- Storage policies pro bucket ticket-attachments
create policy "ticket attachments select for authenticated"
  on storage.objects for select to authenticated
  using (bucket_id = 'ticket-attachments');

create policy "ticket attachments insert for authenticated"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'ticket-attachments');

create policy "ticket attachments delete for authenticated"
  on storage.objects for delete to authenticated
  using (bucket_id = 'ticket-attachments');
