-- RPC pra o admin listar todos os profiles com o email do auth.users.
-- SECURITY DEFINER: bypassa RLS e permite acesso a auth.users. A propria funcao
-- verifica que o caller e admin (retorna zero linhas caso contrario).

create or replace function public.admin_list_profiles()
returns table (id uuid, name text, role text, approved boolean, email text)
language sql
security definer
set search_path = public
stable
as $$
  select p.id, p.name, p.role::text, p.approved, u.email::text
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_admin()
  order by p.approved asc, p.name asc;
$$;

grant execute on function public.admin_list_profiles() to authenticated;
