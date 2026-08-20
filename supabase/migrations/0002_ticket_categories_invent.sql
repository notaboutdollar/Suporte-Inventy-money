-- Substitui o enum ticket_category (que veio do Rapidz — cartão cripto)
-- pelos valores certos pro contexto Invent Money (treinamento de IA).
-- Aplicar via Supabase SQL Editor.
--
-- Se já existirem tickets criados com valores antigos, o cast vai falhar.
-- Nesse caso, delete os tickets de teste primeiro:
--   delete from public.tickets;

alter table public.tickets alter column category drop default;
alter table public.tickets alter column category type text using category::text;
drop type ticket_category;

create type ticket_category as enum (
  'tarefa_sumiu',
  'erro_gravacao',
  'rejeicao_tarefa',
  'saque',
  'perfil_dados',
  'indicacao',
  'kyc',
  'outro'
);

alter table public.tickets alter column category type ticket_category using category::ticket_category;
