"use server";

import { createClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/lib/roles";

export async function updateOwnProfile(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Nome não pode ficar vazio.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão inválida.");

  const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);
  if (error) {
    console.error("[updateOwnProfile] failed:", error);
    throw new Error(error.message);
  }
}

export async function approveUser(targetUserId: string, role: ProfileRole) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão inválida.");

  const { data: caller } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (caller?.role !== "admin") {
    throw new Error("Apenas admins podem aprovar usuários.");
  }

  const { error, count } = await supabase
    .from("profiles")
    .update({ approved: true, role }, { count: "exact" })
    .eq("id", targetUserId);
  if (error) {
    console.error("[approveUser] failed:", error);
    throw new Error(error.message);
  }
  if (count === 0) {
    throw new Error("Nenhum usuário atualizado.");
  }
}

export async function updateUserRole(targetUserId: string, role: ProfileRole) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão inválida.");

  const { data: caller } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (caller?.role !== "admin") {
    throw new Error("Apenas admins podem mudar roles.");
  }

  if (targetUserId === user.id && role !== "admin") {
    throw new Error("Você não pode se remover de admin. Peça pra outro admin fazer isso.");
  }

  const { error, count } = await supabase
    .from("profiles")
    .update({ role }, { count: "exact" })
    .eq("id", targetUserId);
  if (error) {
    console.error("[updateUserRole] failed:", error);
    throw new Error(error.message);
  }
  if (count === 0) {
    throw new Error("Nenhum usuário foi atualizado (RLS bloqueou ou id inválido).");
  }
}
