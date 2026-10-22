"use server";

import { getActor } from "@/lib/session";
import {
  isTicketImageMime,
  MAX_TICKET_IMAGE_BYTES,
  MAX_TICKET_IMAGES,
  TICKET_ATTACHMENTS_BUCKET,
  type TicketAttachment,
  type TicketCategory,
  type TicketStatus,
} from "@/lib/tickets";

async function currentActor() {
  const { supabase, userId } = await getActor();
  return { supabase, actorId: userId };
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

  return ticket.id as string;
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

  const { supabase, actorId } = await currentActor();

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

  await supabase.from("ticket_events").insert({
    ticket_id: id,
    actor_id: actorId,
    kind: "edited",
    payload: {},
  });
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

}

export async function deleteTicket(id: string) {
  const { supabase } = await currentActor();
  const { error, count } = await supabase.from("tickets").delete({ count: "exact" }).eq("id", id);
  if (error) {
    console.error("[deleteTicket] failed:", error);
    throw new Error(error.message);
  }
  if (count === 0) {
    throw new Error("Sem permissão pra excluir. Apenas admins podem excluir tickets.");
  }
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

}

export async function addTicketAttachment(input: {
  ticketId: string;
  storagePath: string;
  filename: string;
  mime: string;
  size: number;
}): Promise<TicketAttachment> {
  const ticketId = input.ticketId;
  const storagePath = input.storagePath;
  if (!/^[0-9a-f-]{36}$/i.test(ticketId)) throw new Error("Ticket inválido.");
  if (!storagePath.startsWith(`${ticketId}/`) || storagePath.includes("..")) {
    throw new Error("Caminho de imagem inválido.");
  }
  if (!isTicketImageMime(input.mime)) throw new Error("Use PNG, JPG, GIF ou WebP.");
  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > MAX_TICKET_IMAGE_BYTES) {
    throw new Error("Cada imagem pode ter no máximo 5 MB.");
  }

  const { supabase } = await currentActor();
  const { count, error: countError } = await supabase
    .from("ticket_attachments")
    .select("id", { count: "exact", head: true })
    .eq("ticket_id", ticketId);
  if (countError) throw new Error(countError.message);
  if ((count ?? 0) >= MAX_TICKET_IMAGES) {
    throw new Error("Um ticket pode ter no máximo 4 imagens.");
  }

  const filename = input.filename.trim().slice(0, 180) || "imagem";
  const { data, error } = await supabase
    .from("ticket_attachments")
    .insert({
      ticket_id: ticketId,
      storage_path: storagePath,
      filename,
      mime: input.mime,
      size: Math.round(input.size),
    })
    .select("id, storage_path, filename, mime, size")
    .single();
  if (error) throw new Error(error.message);
  return data as TicketAttachment;
}

export async function removeTicketAttachment(id: string) {
  const { supabase } = await currentActor();
  const { data, error } = await supabase
    .from("ticket_attachments")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);

  const { error: storageError } = await supabase.storage
    .from(TICKET_ATTACHMENTS_BUCKET)
    .remove([data.storage_path as string]);
  if (storageError) throw new Error(storageError.message);

  const { error: deleteError } = await supabase.from("ticket_attachments").delete().eq("id", id);
  if (deleteError) throw new Error(deleteError.message);
}
