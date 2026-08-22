-- A policy "profiles update own except role" comparava role com uma subquery
-- em public.profiles, cai na mesma recursao que a 0008 corrigiu. Solucao:
-- funcao current_role() SECURITY DEFINER.

create or replace function public.current_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role::text from public.profiles where id = auth.uid();
$$;

drop policy if exists "profiles update own except role" on public.profiles;
create policy "profiles update own except role"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role::text = public.current_role()
  );
