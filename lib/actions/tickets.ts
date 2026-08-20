"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TicketCategory, TicketStatus } from "@/lib/tickets";

async function currentActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, actorId: user?.id ?? null };
}

function parseCreatedAt(input: string | null | undefined) {
  if (!input) return undefined;
  const parsed = new Date(input);
  if (isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

export async function createTicket(formData: FormData) {
  const whatsapp = (formData.get("whatsapp") as string) || null;
  const email = (formData.get("email") as string) || null;
  const category = formData.get("category") as TicketCategory;
  const description = formData.get("description") as string;
  const assignee_id = (formData.get("assignee_id") as string) || null;
  const created_at = parseCreatedAt(formData.get("created_at") as string);
  const notes = (formData.get("notes") as string) || "";
  const status = ((formData.get("status") as TicketStatus) || "solicitado") as TicketStatus;

  const { supabase, actorId } = await currentActor();

  const insertPayload: Record<string, unknown> = {
    whatsapp,
    email,
    category,
    description,
    status,
    extra_data: notes ? { notes } : {},
    assignee_id,
  };
  if (created_at) insertPayload.created_at = created_at;

  const { data: ticket, error } = await supabase
    .from("tickets")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    console.error("[createTicket] insert failed:", error, "payload:", insertPayload);
    throw new Error(error.message);
  }

  const { error: eventError } = await supabase.from("ticket_events").insert({
    ticket_id: ticket.id,
    actor_id: actorId,
    kind: "created",
    payload: {},
  });
  if (eventError) {
    console.error("[createTicket] event insert failed:", eventError);
  }

  revalidatePath("/suporte");
}

export async function updateTicket(id: string, formData: FormData) {
  const whatsapp = (formData.get("whatsapp") as string) || null;
  const email = (formData.get("email") as string) || null;
  const category = formData.get("category") as TicketCategory;
  const description = formData.get("description") as string;
  const assignee_id = (formData.get("assignee_id") as string) || null;
  const created_at = parseCreatedAt(formData.get("created_at") as string);
  const notes = (formData.get("notes") as string) || "";
  const status = formData.get("status") as TicketStatus;

  const { supabase } = await currentActor();

  const updatePayload: Record<string, unknown> = {
    whatsapp,
    email,
    category,
    description,
    status,
    extra_data: notes ? { notes } : {},
    assignee_id,
  };
  if (created_at) updatePayload.created_at = created_at;

  const { error } = await supabase.from("tickets").update(updatePayload).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/suporte");
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
  const { supabase, actorId } = await currentActor();

  const { data: previous } = await supabase.from("tickets").select("status").eq("id", id).single();

  const { error } = await supabase.from("tickets").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("ticket_events").insert({
    ticket_id: id,
    actor_id: actorId,
    kind: "status_change",
    payload: { from: previous?.status ?? null, to: status },
  });

  revalidatePath("/suporte");
}

export async function deleteTicket(id: string) {
  const { supabase } = await currentActor();
  const { error } = await supabase.from("tickets").delete().eq("id", id);
  if (error) {
    console.error("[deleteTicket] failed:", error);
    throw new Error(error.message);
  }
  revalidatePath("/suporte");
}

export async function updateTicketAssignee(id: string, assigneeId: string | null) {
  const { supabase, actorId } = await currentActor();

  const { error } = await supabase.from("tickets").update({ assignee_id: assigneeId }).eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("ticket_events").insert({
    ticket_id: id,
    actor_id: actorId,
    kind: "assigned",
    payload: { assignee_id: assigneeId },
  });

  revalidatePath("/suporte");
}
