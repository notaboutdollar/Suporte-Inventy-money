-- Tickets marcados entram no relatório que vai pra Invent.
-- A coluna herda as policies já existentes da tabela tickets:
--   select  → "tickets select for approved" (public.is_approved())
--   insert  → "tickets insert for admin or moderator"
--   update  → "tickets update for admin or moderator" (public.is_admin_or_moderator())
--   delete  → "tickets delete for admin"
-- Nenhuma policy nova: member continua só lendo; admin e moderator atualizam a linha inteira.

alter table public.tickets
  add column send_to_invent boolean not null default false;

create index tickets_send_to_invent_idx
  on public.tickets (created_at desc)
  where send_to_invent;
