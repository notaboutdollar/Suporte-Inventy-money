-- As policies anteriores usavam `exists (select ... from public.profiles ...)`
-- dentro do USING de policies em profiles. Isso reaplica a mesma policy na
-- subquery → recursao → Postgres retorna 0 rows silenciosamente e o middleware
-- passa a tratar todo mundo como nao-aprovado.
--
-- Solucao: encapsular a checagem em funcoes SECURITY DEFINER que bypassam RLS.
-- Reescreve todas as policies afetadas pra usar essas funcoes.

create or replace function public.is_approved()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(approved, false) from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(role = 'admin', false) from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin_or_moderator()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(role in ('admin','moderator'), false) from public.profiles where id = auth.uid();
$$;

-- profiles
drop policy if exists "profiles select for approved or own" on public.profiles;
create policy "profiles select for approved or own"
  on public.profiles for select to authenticated
  using (public.is_approved() or id = auth.uid());

drop policy if exists "profiles update by admin" on public.profiles;
create policy "profiles update by admin"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- tickets
drop policy if exists "tickets select for approved" on public.tickets;
create policy "tickets select for approved"
  on public.tickets for select to authenticated
  using (public.is_approved());

drop policy if exists "tickets insert for admin or moderator" on public.tickets;
create policy "tickets insert for admin or moderator"
  on public.tickets for insert to authenticated
  with check (public.is_admin_or_moderator());

drop policy if exists "tickets update for admin or moderator" on public.tickets;
create policy "tickets update for admin or moderator"
  on public.tickets for update to authenticated
  using (public.is_admin_or_moderator())
  with check (public.is_admin_or_moderator());

drop policy if exists "tickets delete for admin" on public.tickets;
create policy "tickets delete for admin"
  on public.tickets for delete to authenticated
  using (public.is_admin());

-- ticket_events
drop policy if exists "events select for approved" on public.ticket_events;
create policy "events select for approved"
  on public.ticket_events for select to authenticated
  using (public.is_approved());

drop policy if exists "events insert for admin or moderator" on public.ticket_events;
create policy "events insert for admin or moderator"
  on public.ticket_events for insert to authenticated
  with check (public.is_admin_or_moderator());

-- ticket_attachments
drop policy if exists "attachments select for approved" on public.ticket_attachments;
create policy "attachments select for approved"
  on public.ticket_attachments for select to authenticated
  using (public.is_approved());

drop policy if exists "attachments insert for admin or moderator" on public.ticket_attachments;
create policy "attachments insert for admin or moderator"
  on public.ticket_attachments for insert to authenticated
  with check (public.is_admin_or_moderator());

drop policy if exists "attachments delete for admin or moderator" on public.ticket_attachments;
create policy "attachments delete for admin or moderator"
  on public.ticket_attachments for delete to authenticated
  using (public.is_admin_or_moderator());
