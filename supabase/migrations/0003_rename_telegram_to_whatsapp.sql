-- A comunidade da Invent Money é no WhatsApp, não no Telegram.
-- Renomeia a coluna para bater com o contexto.

alter table public.tickets rename column telegram_handle to whatsapp;
