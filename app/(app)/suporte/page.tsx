import { PageHeader } from "../_components/page-header";
import { NewTicketForm } from "./_components/new-ticket-form";
import { TicketsTable } from "./_components/tickets-table";
import { createClient } from "@/lib/supabase/server";
import type { Ticket, TicketStatus } from "@/lib/tickets";

export default async function SuportePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("tickets")
    .select("id, telegram_handle, email, category, description, status, created_at, assignee:profiles(name)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  const tickets = (data ?? []) as unknown as Ticket[];

  return (
    <>
      <PageHeader title="Suporte" />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <NewTicketForm />
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
      </div>
    </>
  );
}
