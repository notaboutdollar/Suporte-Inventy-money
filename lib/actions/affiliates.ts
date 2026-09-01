"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  AffiliateEngagement,
  AffiliateNiche,
  AffiliateOrigin,
  AffiliateStatus,
  Social,
} from "@/lib/affiliates";

async function currentActor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, actorId: user?.id ?? null };
}

function nullable(v: FormDataEntryValue | null): string | null {
  if (v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function parseDate(v: FormDataEntryValue | null): string | null {
  const s = nullable(v);
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return s;
}

function parseSocials(formData: FormData): Social[] {
  return formData.getAll("socials").map((v) => String(v) as Social);
}

function buildPayload(formData: FormData) {
  return {
    name: (formData.get("name") as string)?.trim() || "",
    handle: nullable(formData.get("handle")),
    phone: nullable(formData.get("phone")),
    email: nullable(formData.get("email")),
    state: nullable(formData.get("state")),
    city: nullable(formData.get("city")),
    origin: (nullable(formData.get("origin")) as AffiliateOrigin | null) ?? null,
    niche: (nullable(formData.get("niche")) as AffiliateNiche | null) ?? null,
    engagement:
      (nullable(formData.get("engagement")) as AffiliateEngagement | null) ?? null,
    status: ((formData.get("status") as AffiliateStatus) || "novo") as AffiliateStatus,
    first_contact_at: parseDate(formData.get("first_contact_at")),
    last_contact_at: parseDate(formData.get("last_contact_at")),
    follow_up_at: parseDate(formData.get("follow_up_at")),
    conversion_trigger: nullable(formData.get("conversion_trigger")),
    notes: nullable(formData.get("notes")),
    media_kit_url: nullable(formData.get("media_kit_url")),
    assignee_id: nullable(formData.get("assignee_id")),
    socials: parseSocials(formData),
  };
}

export async function createAffiliate(formData: FormData) {
  const payload = buildPayload(formData);
  if (!payload.name) throw new Error("Nome é obrigatório.");

  const { supabase, actorId } = await currentActor();

  const { data, error } = await supabase
    .from("affiliates")
    .insert({ ...payload, created_by: actorId })
    .select("id")
    .single();

  if (error) {
    console.error("[createAffiliate] insert failed:", error, "payload:", payload);
    throw new Error(error.message);
  }

  await supabase.from("affiliate_events").insert({
    affiliate_id: data.id,
    actor_id: actorId,
    kind: "created",
    payload: {},
  });
}

export async function updateAffiliate(id: string, formData: FormData) {
  const payload = buildPayload(formData);
  if (!payload.name) throw new Error("Nome é obrigatório.");

  const { supabase, actorId } = await currentActor();

  const { error } = await supabase.from("affiliates").update(payload).eq("id", id);
  if (error) {
    console.error("[updateAffiliate] failed:", error);
    throw new Error(error.message);
  }

  await supabase.from("affiliate_events").insert({
    affiliate_id: id,
    actor_id: actorId,
    kind: "edited",
    payload: {},
  });
}

export async function updateAffiliateStatus(id: string, status: AffiliateStatus) {
  const { supabase, actorId } = await currentActor();

  const { data: previous } = await supabase
    .from("affiliates")
    .select("status")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("affiliates").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("affiliate_events").insert({
    affiliate_id: id,
    actor_id: actorId,
    kind: "status_change",
    payload: { from: previous?.status ?? null, to: status },
  });
}

export async function updateAffiliateAssignee(id: string, assigneeId: string | null) {
  const { supabase, actorId } = await currentActor();

  const { error } = await supabase
    .from("affiliates")
    .update({ assignee_id: assigneeId })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("affiliate_events").insert({
    affiliate_id: id,
    actor_id: actorId,
    kind: "assigned",
    payload: { assignee_id: assigneeId },
  });
}

export async function deleteAffiliate(id: string) {
  const { supabase } = await currentActor();
  const { error, count } = await supabase
    .from("affiliates")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) {
    console.error("[deleteAffiliate] failed:", error);
    throw new Error(error.message);
  }
  if (count === 0) {
    throw new Error("Sem permissão pra excluir. Apenas admins podem excluir criadores.");
  }
}
