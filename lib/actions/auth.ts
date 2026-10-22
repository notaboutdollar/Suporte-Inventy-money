"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function loginErrorMessage(error: { message: string; code?: string | null; name?: string }) {
  const code = error.code ?? "";
  const message = error.message.toLowerCase();
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar. Olhe a caixa de entrada.";
  }
  if (
    error.name === "AuthRetryableFetchError" ||
    code === "request_timeout" ||
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("timeout") ||
    message.includes("econn")
  ) {
    return "Não foi possível conectar. Tente de novo em instantes.";
  }
  return "E-mail ou senha inválidos.";
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(loginErrorMessage(error))}`);
  }

  redirect("/");
}

export async function signup(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    redirect(`/signup?error=${encodeURIComponent("Preencha todos os campos.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/aguardando-aprovacao");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
