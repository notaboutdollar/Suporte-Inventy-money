-- Endurece as policies pra respeitar os 3 novos roles.
-- Member: so SELECT em tickets. Moderator: SELECT + INSERT + UPDATE. Admin: tudo.
-- Ninguem pode escalar o proprio role — so admin pode atualizar role de outros.

drop policy if exists "tickets insert for authenticated" on public.tickets;
drop policy if exists "tickets update for authenticated" on public.tickets;

create policy "tickets insert for admin or moderator"
  on public.tickets for insert to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator'))
  );

create policy "tickets update for admin or moderator"
  on public.tickets for update to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator'))
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator'))
  );

-- Mesmo padrao pra ticket_events (log append-only) — member nao insere eventos
drop policy if exists "events insert for authenticated" on public.ticket_events;

create policy "events insert for admin or moderator"
  on public.ticket_events for insert to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator'))
  );

-- Attachments — mesmo padrao
drop policy if exists "attachments insert for authenticated" on public.ticket_attachments;
drop policy if exists "attachments delete for authenticated" on public.ticket_attachments;

create policy "attachments insert for admin or moderator"
  on public.ticket_attachments for insert to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator'))
  );

create policy "attachments delete for admin or moderator"
  on public.ticket_attachments for delete to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','moderator'))
  );

-- Profiles: usuario pode atualizar proprio profile, mas nao pode escalar o proprio role.
-- Admin pode atualizar qualquer profile (incluindo role).
drop policy if exists "profiles update own" on public.profiles;

create policy "profiles update own except role"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

create policy "profiles update by admin"
  on public.profiles for update to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
