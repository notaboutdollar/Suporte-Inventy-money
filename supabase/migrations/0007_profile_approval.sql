-- Novo fluxo: cadastro publico via /signup, admin aprova antes de liberar acesso.
-- Adiciona coluna approved em profiles. Usuarios existentes (admin/moderator)
-- ficam aprovados automaticamente pra nao quebrar sessao.
-- Novos usuarios entram como approved=false.

alter table public.profiles add column approved boolean not null default false;

update public.profiles
  set approved = true
  where role in ('admin','moderator');

-- Ajusta o trigger handle_new_user: novos usuarios ficam pending (approved=false)
-- e o admin decide o role na hora da aprovacao. Role default 'member' vira placeholder
-- ate ser aprovado — RLS trata approved=false como sem acesso, entao role nao importa.

-- Policy de select em profiles: usuario nao-aprovado so pode ver o proprio profile
-- (pra a pagina /aguardando-aprovacao funcionar).
drop policy if exists "profiles select for authenticated" on public.profiles;

create policy "profiles select for approved or own"
  on public.profiles for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
    or id = auth.uid()
  );

-- RLS de tickets: usuario nao-aprovado nao ve nada
drop policy if exists "tickets select for authenticated" on public.tickets;
create policy "tickets select for approved"
  on public.tickets for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

drop policy if exists "events select for authenticated" on public.ticket_events;
create policy "events select for approved"
  on public.ticket_events for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

drop policy if exists "attachments select for authenticated" on public.ticket_attachments;
create policy "attachments select for approved"
  on public.ticket_attachments for select to authenticated using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );
