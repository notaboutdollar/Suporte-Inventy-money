-- Novo role 'gerente': gerencia criadores/kanban, sem acesso a suporte.
-- Aplicar via Supabase SQL Editor.

-- 1. Adiciona valor ao enum
ALTER TYPE profile_role ADD VALUE 'gerente';

-- 2. Helper function pra checagem de acesso a criadores
CREATE OR REPLACE FUNCTION public.is_admin_or_gerente()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT coalesce(role IN ('admin','gerente'), false) FROM public.profiles WHERE id = auth.uid();
$$;

-- 3. Atualiza policies de affiliates: moderador sai, gerente entra
DROP POLICY IF EXISTS "affiliates insert for admin or moderator" ON public.affiliates;
CREATE POLICY "affiliates insert for admin or gerente"
  ON public.affiliates FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_gerente());

DROP POLICY IF EXISTS "affiliates update for admin or moderator" ON public.affiliates;
CREATE POLICY "affiliates update for admin or gerente"
  ON public.affiliates FOR UPDATE TO authenticated
  USING (public.is_admin_or_gerente())
  WITH CHECK (public.is_admin_or_gerente());

-- 4. Atualiza policies de affiliate_events
DROP POLICY IF EXISTS "affiliate events insert for admin or moderator" ON public.affiliate_events;
CREATE POLICY "affiliate events insert for admin or gerente"
  ON public.affiliate_events FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_gerente());
