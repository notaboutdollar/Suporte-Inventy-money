import { PageHeader } from "../_components/page-header";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_COLORS, CATEGORY_LABELS, STATUS_LABELS, type TicketCategory, type TicketStatus } from "@/lib/tickets";

type EventKind = "created" | "status_change" | "assigned" | "comment" | "edited";

type EventRow = {
  id: string;
  kind: EventKind;
  payload: { from?: string; to?: string; assignee_id?: string | null } | null;
  created_at: string;
  actor: { name: string } | null;
  ticket: {
    id: string;
    description: string;
    whatsapp: string | null;
    email: string | null;
    category: TicketCategory;
  } | null;
};

function bucketByDay(events: EventRow[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const buckets = new Map<string, EventRow[]>();
  for (const e of events) {
    const d = new Date(e.created_at);
    d.setHours(0, 0, 0, 0);
    let label: string;
    if (d.getTime() === today.getTime()) label = "Hoje";
    else if (d.getTime() === yesterday.getTime()) label = "Ontem";
    else label = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(d);
    if (!buckets.has(label)) buckets.set(label, []);
    buckets.get(label)!.push(e);
  }
  return Array.from(buckets.entries());
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function ticketLabel(ticket: EventRow["ticket"]) {
  if (!ticket) return "um ticket removido";
  const contact = ticket.whatsapp || ticket.email;
  const desc = ticket.description.length > 60 ? ticket.description.slice(0, 60) + "…" : ticket.description;
  return contact ? `${contact} — ${desc}` : desc;
}

function renderEvent(e: EventRow) {
  const actor = e.actor?.name ?? "Alguém";
  switch (e.kind) {
    case "created":
      return (
        <>
          <strong>{actor}</strong> criou o ticket
        </>
      );
    case "status_change": {
      const from = e.payload?.from ? STATUS_LABELS[e.payload.from as TicketStatus] ?? e.payload.from : null;
      const to = e.payload?.to ? STATUS_LABELS[e.payload.to as TicketStatus] ?? e.payload.to : null;
      return (
        <>
          <strong>{actor}</strong> mudou o status{from ? ` de ${from}` : ""}
          {to ? ` para ${to}` : ""}
        </>
      );
    }
    case "assigned":
      return (
        <>
          <strong>{actor}</strong>{" "}
          {e.payload?.assignee_id ? "atribuiu um responsável" : "removeu o responsável"}
        </>
      );
    case "edited":
      return (
        <>
          <strong>{actor}</strong> editou o ticket
        </>
      );
    case "comment":
      return (
        <>
          <strong>{actor}</strong> comentou no ticket
        </>
      );
    default:
      return <strong>{actor}</strong>;
  }
}

export default async function HistoricoPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ticket_events")
    .select(
      "id, kind, payload, created_at, actor:profiles!ticket_events_actor_id_fkey(name), ticket:tickets!ticket_events_ticket_id_fkey(id, description, whatsapp, email, category)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const events: EventRow[] = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const actorRaw = r.actor as { name?: string } | { name?: string }[] | null;
    const actor = Array.isArray(actorRaw) ? actorRaw[0] ?? null : actorRaw;
    const ticketRaw = r.ticket as EventRow["ticket"] | EventRow["ticket"][] | null;
    const ticket = Array.isArray(ticketRaw) ? ticketRaw[0] ?? null : ticketRaw;
    return {
      id: r.id as string,
      kind: r.kind as EventKind,
      payload: (r.payload as EventRow["payload"]) ?? null,
      created_at: r.created_at as string,
      actor: actor?.name ? { name: actor.name } : null,
      ticket,
    };
  });

  const buckets = bucketByDay(events);

  return (
    <>
      <PageHeader title="Histórico" />

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
          Erro ao carregar histórico: {error.message}
        </div>
      ) : events.length === 0 ? (
        <div
          className="soft"
          style={{ background: "#ffffff", borderRadius: "var(--r-card)", padding: "var(--space-8)", textAlign: "center", opacity: 0.6 }}
        >
          Nenhuma atividade registrada ainda.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {buckets.map(([day, items]) => (
            <div
              key={day}
              className="soft"
              style={{ background: "#ffffff", borderRadius: "var(--r-card)", padding: "var(--space-6)" }}
            >
              <h5 style={{ margin: "0 0 var(--space-4)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.55 }}>
                {day}
              </h5>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {items.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "var(--space-4)",
                      padding: "var(--space-3) 0",
                      borderBottom: "1px solid var(--color-neutral-200)",
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "var(--r-pill)",
                        background: "var(--color-accent-200)",
                        color: "var(--color-accent-800)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-heading)",
                        fontWeight: 800,
                        fontSize: 12,
                        flex: "none",
                      }}
                    >
                      {initials(e.actor?.name ?? "?")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ fontSize: 14 }}>{renderEvent(e)}</div>
                      {e.ticket && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, opacity: 0.7 }}>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "var(--r-pill)",
                              background: CATEGORY_COLORS[e.ticket.category],
                              flex: "none",
                            }}
                          />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {CATEGORY_LABELS[e.ticket.category]} · {ticketLabel(e.ticket)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.5, whiteSpace: "nowrap" }}>{formatTime(e.created_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
