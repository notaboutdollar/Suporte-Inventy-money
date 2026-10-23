import { PageHeader } from "../_components/page-header";
import { SuporteWorkspace } from "./_components/suporte-workspace";
import { getSessionContext } from "@/lib/session";
import { TICKET_LIST_SELECT, toTicket, type Profile, type TicketStatus } from "@/lib/tickets";

export default async function SuportePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const { supabase, role } = await getSessionContext();
  const canEdit = role === "admin" || role === "moderator";

  const profilesQuery = supabase.from("profiles").select("id, name").order("name");

  const ticketsQuery = supabase.from("tickets").select(TICKET_LIST_SELECT).order("created_at", { ascending: false });

  const [{ data: profilesData }, { data: ticketsData, error }] = await Promise.all([profilesQuery, ticketsQuery]);
  const profiles = (profilesData ?? []) as Profile[];
  const tickets = (ticketsData ?? []).map((row) => toTicket(row as Record<string, unknown>));

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
            background: "var(--color-card)",
            borderRadius: "var(--r-card)",
            padding: "var(--space-6)",
            color: "var(--color-accent-700)",
          }}
        >
          Erro ao carregar tickets: {error.message}
        </div>
      ) : (
        <SuporteWorkspace
          tickets={tickets}
          profiles={profiles}
          activeStatus={status as TicketStatus | undefined}
          canEdit={canEdit}
        />
      )}
    </>
  );
}
