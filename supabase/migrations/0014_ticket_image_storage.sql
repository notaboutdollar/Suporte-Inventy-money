-- Imagens de ticket: limita o bucket privado a imagens de até 5 MB
-- e alinha o storage com os papéis (leitura: aprovados; escrita: admin/moderador).
-- Aplicar no projeto de produção (SQL Editor ou `supabase db push`).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ticket-attachments',
  'ticket-attachments',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "ticket attachments select for authenticated" on storage.objects;
drop policy if exists "ticket attachments select for approved" on storage.objects;
create policy "ticket attachments select for approved"
  on storage.objects for select to authenticated
  using (bucket_id = 'ticket-attachments' and public.is_approved());

drop policy if exists "ticket attachments insert for authenticated" on storage.objects;
drop policy if exists "ticket attachments insert for admin or moderator" on storage.objects;
create policy "ticket attachments insert for admin or moderator"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'ticket-attachments' and public.is_admin_or_moderator());

drop policy if exists "ticket attachments delete for authenticated" on storage.objects;
drop policy if exists "ticket attachments delete for admin or moderator" on storage.objects;
create policy "ticket attachments delete for admin or moderator"
  on storage.objects for delete to authenticated
  using (bucket_id = 'ticket-attachments' and public.is_admin_or_moderator());
