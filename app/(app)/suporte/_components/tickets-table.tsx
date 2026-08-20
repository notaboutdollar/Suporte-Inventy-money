import Link from "next/link";
import type { Ticket, TicketStatus } from "@/lib/tickets";
import { CATEGORY_COLORS, CATEGORY_LABELS, STATUS_LABELS, STATUS_ORDER } from "@/lib/tickets";

const STATUS_TAG_STYLE: Record<TicketStatus, { border: string; color: string }> = {
  solicitado: { border: "var(--color-neutral-400)", color: "var(--color-neutral-700)" },
  em_andamento: { border: "var(--color-accent-500)", color: "var(--color-accent-700)" },
  aguardando_cliente: { border: "var(--color-neutral-500)", color: "var(--color-neutral-800)" },
  resolvido: { border: "var(--color-accent-700)", color: "var(--color-accent-700)" },
  fechado: { border: "var(--color-neutral-300)", color: "var(--color-neutral-600)" },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
}

function elapsed(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function TicketsTable({ tickets, activeStatus }: { tickets: Ticket[]; activeStatus?: TicketStatus }) {
  return (
    <div className="soft" style={{ background: "#ffffff", borderRadius: "var(--r-card)", padding: "var(--space-6)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          flexWrap: "wrap",
          marginBottom: "var(--space-4)",
        }}
      >
        <h4 style={{ margin: 0 }}>Todos os tickets</h4>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StatusFilterLink label="Todos" href="/suporte" active={!activeStatus} />
          {STATUS_ORDER.map((status) => (
            <StatusFilterLink
              key={status}
              label={STATUS_LABELS[status]}
              href={`/suporte?status=${status}`}
              active={activeStatus === status}
            />
          ))}
        </div>
      </div>

      {tickets.length === 0 ? (
        <p style={{ opacity: 0.6, fontSize: 14, margin: 0, padding: "var(--space-6) 0", textAlign: "center" }}>
          Nenhum ticket encontrado.
        </p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Contato</th>
              <th>Categoria</th>
              <th>Descrição</th>
              <th>Responsável</th>
              <th>Aberto</th>
              <th>Tempo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => {
              const tag = STATUS_TAG_STYLE[t.status];
              return (
                <tr key={t.id}>
                  <td>{t.whatsapp || t.email || "—"}</td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "var(--r-pill)",
                          background: CATEGORY_COLORS[t.category],
                          flex: "none",
                        }}
                      />
                      {CATEGORY_LABELS[t.category]}
                    </span>
                  </td>
                  <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.description}
                  </td>
                  <td>{t.assignee?.name ?? "—"}</td>
                  <td>{formatDate(t.created_at)}</td>
                  <td style={{ opacity: 0.65 }}>{elapsed(t.created_at)}</td>
                  <td>
                    <span
                      className="tag"
                      style={{
                        borderRadius: "var(--r-sm)",
                        border: `1px solid ${tag.border}`,
                        color: tag.color,
                        padding: "4px 14px",
                      }}
                    >
                      {STATUS_LABELS[t.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatusFilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className="btn"
      style={{
        fontSize: 12,
        padding: "6px 12px",
        background: active ? "var(--color-accent)" : "var(--color-neutral-100)",
        color: active ? "#ffffff" : "var(--color-text)",
        borderRadius: "var(--r-sm)",
      }}
    >
      {label}
    </Link>
  );
}
