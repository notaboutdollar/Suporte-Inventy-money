import { PageHeader } from "../_components/page-header";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  STATUS_LABELS as TICKET_STATUS_LABELS,
  type TicketCategory,
  type TicketStatus,
} from "@/lib/tickets";
import {
  NICHE_COLORS,
  NICHE_LABELS,
  STATUS_LABELS as AFF_STATUS_LABELS,
  type AffiliateNiche,
  type AffiliateStatus,
} from "@/lib/affiliates";

type EventKind = "created" | "status_change" | "assigned" | "comment" | "edited";
type Origin = "ticket" | "affiliate";

type Event = {
  id: string;
  origin: Origin;
  kind: EventKind;
  payload: { from?: string; to?: string; assignee_id?: string | null } | null;
  created_at: string;
  actor: { name: string } | null;
  ticket?: {
    id: string;
    description: string;
    whatsapp: string | null;
    email: string | null;
    category: TicketCategory;
  } | null;
  affiliate?: {
    id: string;
    name: string;
    handle: string | null;
    niche: AffiliateNiche | null;
  } | null;
};

function bucketByDay(events: Event[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const buckets = new Map<string, Event[]>();
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

function ticketLabel(t: NonNullable<Event["ticket"]>) {
  const contact = t.whatsapp || t.email;
  const desc = t.description.length > 60 ? t.description.slice(0, 60) + "…" : t.description;
  return contact ? `${contact} — ${desc}` : desc;
}

function renderTicketEvent(e: Event) {
  const actor = e.actor?.name ?? "Alguém";
  switch (e.kind) {
    case "created":
      return <><strong>{actor}</strong> criou o ticket</>;
    case "status_change": {
      const from = e.payload?.from ? TICKET_STATUS_LABELS[e.payload.from as TicketStatus] ?? e.payload.from : null;
      const to = e.payload?.to ? TICKET_STATUS_LABELS[e.payload.to as TicketStatus] ?? e.payload.to : null;
      return (
        <>
          <strong>{actor}</strong> mudou o status{from ? ` de ${from}` : ""}
          {to ? ` para ${to}` : ""} do ticket
        </>
      );
    }
    case "assigned":
      return (
        <>
          <strong>{actor}</strong> {e.payload?.assignee_id ? "atribuiu um responsável" : "removeu o responsável"} do ticket
        </>
      );
    case "edited":
      return <><strong>{actor}</strong> editou o ticket</>;
    case "comment":
      return <><strong>{actor}</strong> comentou no ticket</>;
    default:
      return <strong>{actor}</strong>;
  }
}

function renderAffiliateEvent(e: Event) {
  const actor = e.actor?.name ?? "Alguém";
  switch (e.kind) {
    case "created":
      return <><strong>{actor}</strong> cadastrou o criador</>;
    case "status_change": {
      const from = e.payload?.from ? AFF_STATUS_LABELS[e.payload.from as AffiliateStatus] ?? e.payload.from : null;
      const to = e.payload?.to ? AFF_STATUS_LABELS[e.payload.to as AffiliateStatus] ?? e.payload.to : null;
      return (
        <>
          <strong>{actor}</strong> mudou o status{from ? ` de ${from}` : ""}
          {to ? ` para ${to}` : ""} do criador
        </>
      );
    }
    case "assigned":
      return (
        <>
          <strong>{actor}</strong> {e.payload?.assignee_id ? "atribuiu um responsável" : "removeu o responsável"} do criador
        </>
      );
    case "edited":
      return <><strong>{actor}</strong> editou o criador</>;
    case "comment":
      return <><strong>{actor}</strong> comentou no criador</>;
    default:
      return <strong>{actor}</strong>;
  }
}

export default async function HistoricoPage() {
  const supabase = await createClient();

  const [ticketRes, affiliateRes] = await Promise.all([
    supabase
      .from("ticket_events")
      .select(
        "id, kind, payload, created_at, actor:profiles!ticket_events_actor_id_fkey(name), ticket:tickets!ticket_events_ticket_id_fkey(id, description, whatsapp, email, category)"
      )
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("affiliate_events")
      .select(
        "id, kind, payload, created_at, actor:profiles!affiliate_events_actor_id_fkey(name), affiliate:affiliates!affiliate_events_affiliate_id_fkey(id, name, handle, niche)"
      )
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const err = ticketRes.error?.message || affiliateRes.error?.message;

  const events: Event[] = [];

  for (const row of (ticketRes.data ?? []) as Record<string, unknown>[]) {
    const actorRaw = row.actor as { name?: string } | { name?: string }[] | null;
    const actor = Array.isArray(actorRaw) ? actorRaw[0] ?? null : actorRaw;
    const ticketRaw = row.ticket as Event["ticket"] | Event["ticket"][] | null;
    const ticket = Array.isArray(ticketRaw) ? ticketRaw[0] ?? null : ticketRaw;
    events.push({
      id: `t-${row.id as string}`,
      origin: "ticket",
      kind: row.kind as EventKind,
      payload: (row.payload as Event["payload"]) ?? null,
      created_at: row.created_at as string,
      actor: actor?.name ? { name: actor.name } : null,
      ticket,
    });
  }

  for (const row of (affiliateRes.data ?? []) as Record<string, unknown>[]) {
    const actorRaw = row.actor as { name?: string } | { name?: string }[] | null;
    const actor = Array.isArray(actorRaw) ? actorRaw[0] ?? null : actorRaw;
    const affRaw = row.affiliate as Event["affiliate"] | Event["affiliate"][] | null;
    const affiliate = Array.isArray(affRaw) ? affRaw[0] ?? null : affRaw;
    events.push({
      id: `a-${row.id as string}`,
      origin: "affiliate",
      kind: row.kind as EventKind,
      payload: (row.payload as Event["payload"]) ?? null,
      created_at: row.created_at as string,
      actor: actor?.name ? { name: actor.name } : null,
      affiliate,
    });
  }

  events.sort((a, b) => b.created_at.localeCompare(a.created_at));

  const buckets = bucketByDay(events);

  return (
    <>
      <PageHeader title="Histórico" />

      {err ? (
        <div
          className="soft"
          style={{
            background: "#ffffff",
            borderRadius: "var(--r-card)",
            padding: "var(--space-6)",
            color: "var(--color-accent-700)",
          }}
        >
          Erro ao carregar histórico: {err}
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
                      <div style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: e.origin === "ticket" ? "var(--color-accent-700)" : "#166a45",
                            background: e.origin === "ticket" ? "var(--color-accent-100)" : "#e6f6ee",
                            borderRadius: "var(--r-sm)",
                            padding: "2px 8px",
                          }}
                        >
                          {e.origin === "ticket" ? "Suporte" : "Criador"}
                        </span>
                        <span>{e.origin === "ticket" ? renderTicketEvent(e) : renderAffiliateEvent(e)}</span>
                      </div>

                      {e.origin === "ticket" && e.ticket && (
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

                      {e.origin === "affiliate" && e.affiliate && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, opacity: 0.7 }}>
                          {e.affiliate.niche && (
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "var(--r-pill)",
                                background: NICHE_COLORS[e.affiliate.niche],
                                flex: "none",
                              }}
                            />
                          )}
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {e.affiliate.name}
                            {e.affiliate.handle ? ` (${e.affiliate.handle})` : ""}
                            {e.affiliate.niche ? ` · ${NICHE_LABELS[e.affiliate.niche]}` : ""}
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
