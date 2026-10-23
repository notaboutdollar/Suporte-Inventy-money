import { PageHeader } from "../../_components/page-header";
import { InventReport } from "./_components/invent-report";
import { getSessionContext } from "@/lib/session";
import { TICKET_LIST_SELECT, toTicket } from "@/lib/tickets";

export default async function RelatorioInventPage() {
  const { supabase, role } = await getSessionContext();
  const canEdit = role === "admin" || role === "moderator";

  const { data, error } = await supabase
    .from("tickets")
    .select(TICKET_LIST_SELECT)
    .eq("send_to_invent", true)
    .order("created_at", { ascending: false });

  const tickets = (data ?? []).map((row) => toTicket(row as Record<string, unknown>));

  return (
    <>
      <PageHeader title="Relatório Invent" />
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
          Erro ao carregar relatório: {error.message}
        </div>
      ) : (
        <InventReport tickets={tickets} canEdit={canEdit} />
      )}
    </>
  );
}
