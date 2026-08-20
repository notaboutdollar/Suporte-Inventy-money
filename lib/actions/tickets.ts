"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TicketCategory, TicketStatus } from "@/lib/tickets";

export async function createTicket(formData: FormData) {
  const whatsapp = (formData.get("whatsapp") as string) || null;
  const email = (formData.get("email") as string) || null;
  const category = formData.get("category") as TicketCategory;
  const description = formData.get("description") as string;
  const assignee_id = (formData.get("assignee_id") as string) || null;
  const created_at_input = (formData.get("created_at") as string) || "";
  const notes = (formData.get("notes") as string) || "";
  const status = ((formData.get("status") as TicketStatus) || "solicitado") as TicketStatus;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const insertPayload: Record<string, unknown> = {
    whatsapp,
    email,
    category,
    description,
    status,
    extra_data: notes ? { notes } : {},
    assignee_id,
  };

  if (created_at_input) {
    const parsed = new Date(created_at_input);
    if (!isNaN(parsed.getTime())) {
      insertPayload.created_at = parsed.toISOString();
    }
  }

  const { data: ticket, error } = await supabase
    .from("tickets")
    .insert(insertPayload)
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
