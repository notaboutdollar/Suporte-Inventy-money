import { PageHeader } from "../_components/page-header";
import { AfiliadosWorkspace } from "./_components/afiliados-workspace";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/lib/roles";
import type { Profile } from "@/lib/tickets";
import { normalizeSocials, type Affiliate } from "@/lib/affiliates";

export default async function AfiliadosPage() {
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

  const [profilesQ, affiliatesQ] = await Promise.all([
    supabase.from("profiles").select("id, name").order("name"),
    supabase
      .from("affiliates")
      .select(
        "id, name, phone, email, state, city, origin, socials, niche, engagement, status, first_contact_at, last_contact_at, follow_up_at, conversion_trigger, notes, media_kit_url, assignee_id, created_at, updated_at, assignee:profiles!affiliates_assignee_id_fkey(name)"
      )
      .order("created_at", { ascending: false }),
  ]);

  const profiles: Profile[] = ((profilesQ.data as { id: string; name: string }[]) ?? []).map((p) => ({
    id: p.id,
    name: p.name ?? "",
  }));

  const affiliates: Affiliate[] = ((affiliatesQ.data as Record<string, unknown>[]) ?? []).map((row) => {
    const assigneeRaw = row.assignee as { name?: string } | { name?: string }[] | null;
    const assignee = Array.isArray(assigneeRaw) ? assigneeRaw[0] ?? null : assigneeRaw;
    return {
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
      assignee: assignee?.name ? { name: assignee.name } : null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    };
  });

  return (
    <>
      <PageHeader title="Criadores" />

      {affiliatesQ.error ? (
        <div
          className="soft"
          style={{
            background: "#ffffff",
            borderRadius: "var(--r-card)",
            padding: "var(--space-6)",
            color: "var(--color-accent-700)",
          }}
        >
          Erro ao carregar criadores: {affiliatesQ.error.message}
        </div>
      ) : (
        <AfiliadosWorkspace affiliates={affiliates} profiles={profiles} canEdit={canEdit} />
      )}
    </>
  );
}
