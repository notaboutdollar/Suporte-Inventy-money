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
  const tickets = (ticketsData ?? []) as unknown as Ticket[];

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
