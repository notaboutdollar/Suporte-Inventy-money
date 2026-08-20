import { PageHeader } from "../_components/page-header";
import { SuporteWorkspace } from "./_components/suporte-workspace";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Ticket, TicketStatus } from "@/lib/tickets";

export default async function SuportePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  const profilesQuery = supabase.from("profiles").select("id, name").order("name");

  let ticketsQuery = supabase
    .from("tickets")
    .select(
      "id, whatsapp, email, category, description, status, assignee_id, extra_data, created_at, assignee:profiles(name)"
    )
    .order("created_at", { ascending: false });

  if (status) {
    ticketsQuery = ticketsQuery.eq("status", status);
  }

  const [{ data: profilesData }, { data: ticketsData, error }] = await Promise.all([profilesQuery, ticketsQuery]);
  const profiles = (profilesData ?? []) as Profile[];

  const tickets: Ticket[] = (ticketsData ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const assigneeRaw = r.assignee as { name?: string } | { name?: string }[] | null;
    const assignee = Array.isArray(assigneeRaw) ? (assigneeRaw[0] ?? null) : assigneeRaw;
    return {
      id: r.id as string,
      whatsapp: (r.whatsapp as string | null) ?? null,
      email: (r.email as string | null) ?? null,
      category: r.category as Ticket["category"],
      description: (r.description as string) ?? "",
      status: r.status as Ticket["status"],
      assignee_id: (r.assignee_id as string | null) ?? null,
      assignee: assignee?.name ? { name: assignee.name } : null,
      extra_data: (r.extra_data as Ticket["extra_data"]) ?? null,
      created_at: r.created_at as string,
    };
  });

  if (error) {
    console.error("[/suporte] tickets query error:", error);
  }

  return (
    <>
      <PageHeader title="Suporte" />

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
          Erro ao carregar tickets: {error.message}
        </div>
      ) : (
        <SuporteWorkspace tickets={tickets} profiles={profiles} activeStatus={status as TicketStatus | undefined} />
      )}
    </>
  );
}
