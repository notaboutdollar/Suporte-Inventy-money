-- Converte socials de array de nomes para objeto de URLs.
-- Dados antigos (["instagram","youtube"]) viram {}.
-- Aplicar via Supabase SQL Editor.

update public.affiliates
set socials = '{}'::jsonb
where jsonb_typeof(socials) = 'array';
