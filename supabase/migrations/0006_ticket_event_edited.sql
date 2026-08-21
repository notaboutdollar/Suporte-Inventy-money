-- Adiciona 'edited' ao enum ticket_event_kind pra registrar edicoes completas
-- via modal (mudanca de whatsapp/email/categoria/descricao/dados). Mudancas
-- especificas de status e assignee ja usam status_change / assigned.

alter table public.ticket_events alter column kind type text using kind::text;
drop type ticket_event_kind;

create type ticket_event_kind as enum ('created', 'status_change', 'assigned', 'comment', 'edited');

alter table public.ticket_events
  alter column kind type ticket_event_kind using kind::ticket_event_kind;
