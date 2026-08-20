-- Substitui o enum profile_role de (admin, agent) para (admin, moderator, member).
-- Mapeia 'agent' -> 'moderator' pra preservar profiles existentes.
-- Trigger handle_new_user passa a criar novos usuarios como 'member' (mais restritivo).
-- Aplicar via Supabase SQL Editor.

alter table public.profiles alter column role drop default;
alter table public.profiles alter column role type text using role::text;
drop type profile_role;

create type profile_role as enum ('admin', 'moderator', 'member');

alter table public.profiles
  alter column role type profile_role using (
    case role
      when 'agent' then 'moderator'::profile_role
      else role::profile_role
    end
  );

alter table public.profiles alter column role set default 'member';

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
    'member'
  );
  return new;
end;
$$;
