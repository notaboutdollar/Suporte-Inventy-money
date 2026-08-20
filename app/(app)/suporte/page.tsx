import { PageHeader } from "../_components/page-header";
import { NewTicketModal } from "./_components/new-ticket-modal";
import { TicketsTable } from "./_components/tickets-table";
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
    .select("id, whatsapp, email, category, description, status, created_at, assignee:profiles(name)")
    .order("created_at", { ascending: false });

  if (status) {
    ticketsQuery = ticketsQuery.eq("status", status);
  }

  const [{ data: profilesData }, { data: ticketsData, error }] = await Promise.all([profilesQuery, ticketsQuery]);
  const profiles = (profilesData ?? []) as Profile[];
  const tickets = (ticketsData ?? []) as unknown as Ticket[];

  return (
    <>
      <PageHeader title="Suporte" />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-6)" }}>
        <NewTicketModal profiles={profiles} />
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
          Erro ao carregar tickets: {error.message}
        </div>
      ) : (
        <TicketsTable tickets={tickets} activeStatus={status as TicketStatus | undefined} />
      )}
    </>
  );
}
