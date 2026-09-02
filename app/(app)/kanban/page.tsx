import Link from "next/link";
import { PageHeader } from "../_components/page-header";
import { KanbanBoard } from "./_components/kanban-board";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/lib/roles";
import { normalizeSocials, type Affiliate } from "@/lib/affiliates";

export default async function KanbanPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let canEdit = false;
  if (user) {
    const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (me?.role as ProfileRole | undefined) ?? "member";
    canEdit = role === "admin" || role === "gerente";
  }

  const { data, error } = await supabase
    .from("affiliates")
    .select(
      "id, name, phone, email, state, city, origin, socials, niche, engagement, status, first_contact_at, last_contact_at, follow_up_at, conversion_trigger, notes, media_kit_url, assignee_id, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  const affiliates: Affiliate[] = ((data as Record<string, unknown>[]) ?? []).map((row) => ({
    id: row.id as string,
    name: (row.name as string) ?? "",
    phone: (row.phone as string) ?? null,
    email: (row.email as string) ?? null,
    state: (row.state as string) ?? null,
    city: (row.city as string) ?? null,
    origin: (row.origin as Affiliate["origin"]) ?? null,
    socials: normalizeSocials(row.socials),
    niche: (row.niche as Affiliate["niche"]) ?? null,
    engagement: (row.engagement as Affiliate["engagement"]) ?? null,
    status: row.status as Affiliate["status"],
    first_contact_at: (row.first_contact_at as string) ?? null,
    last_contact_at: (row.last_contact_at as string) ?? null,
    follow_up_at: (row.follow_up_at as string) ?? null,
    conversion_trigger: (row.conversion_trigger as string) ?? null,
    notes: (row.notes as string) ?? null,
    media_kit_url: (row.media_kit_url as string) ?? null,
    assignee_id: (row.assignee_id as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }));

  return (
    <>
      <PageHeader title="Kanban" />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-4)",
          gap: "var(--space-4)",
        }}
      >
        <div style={{ fontSize: 13, opacity: 0.65 }}>
          {canEdit
            ? "Arraste os cards para mudar o status de cada criador."
            : "Modo somente-leitura. Membros não podem mover cards."}
        </div>
        <Link href="/afiliados" className="btn btn-secondary" style={{ fontSize: 13 }}>
          Ver como tabela
        </Link>
      </div>

      {error ? (
        <div
          className="soft"
          style={{
            background: "#ffffff",
            borderRadius: "var(--r-card)",
            padding: "var(--space-6)",
            color: "var(--color-accent-700)",
          }}
        >
          Erro ao carregar criadores: {error.message}
        </div>
      ) : (
        <KanbanBoard affiliates={affiliates} canEdit={canEdit} />
      )}
    </>
  );
}
