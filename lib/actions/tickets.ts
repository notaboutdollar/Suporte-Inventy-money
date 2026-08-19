"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TicketCategory } from "@/lib/tickets";

export async function createTicket(formData: FormData) {
  const telegram_handle = (formData.get("telegram_handle") as string) || null;
  const email = (formData.get("email") as string) || null;
  const category = formData.get("category") as TicketCategory;
  const description = formData.get("description") as string;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: ticket, error } = await supabase
    .from("tickets")
    .insert({ telegram_handle, email, category, description })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase.from("ticket_events").insert({
    ticket_id: ticket.id,
    actor_id: user?.id ?? null,
    kind: "created",
    payload: {},
  });

  revalidatePath("/suporte");
}
