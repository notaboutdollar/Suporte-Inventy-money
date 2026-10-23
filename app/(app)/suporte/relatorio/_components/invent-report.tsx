"use client";

import { useState } from "react";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
  type Ticket,
  type TicketCategory,
  type TicketStatus,
} from "@/lib/tickets";
import { SendToInventToggle } from "../../_components/send-to-invent-toggle";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
}

function csvCell(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function downloadCsv(tickets: Ticket[]) {
  const header = ["WhatsApp", "E-mail", "Categoria", "Descrição", "Dados", "Responsável", "Status", "Aberto"];
  const lines = tickets.map((ticket) => [
    ticket.whatsapp ?? "",
    ticket.email ?? "",
    CATEGORY_LABELS[ticket.category],
    ticket.description,
    ticket.extra_data?.notes ?? "",
    ticket.assignee?.name ?? "",
    STATUS_LABELS[ticket.status],
    formatDate(ticket.created_at),
  ]);
  const csv = [header, ...lines].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `invent-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function InventReport({ tickets, canEdit }: { tickets: Ticket[]; canEdit: boolean }) {
  const [hidden, setHidden] = useState<string[]>([]);
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [category, setCategory] = useState<TicketCategory | "">("");

  const rows = tickets.filter((ticket) => !hidden.includes(ticket.id));
  const visible = rows.filter((ticket) => {
    if (status && ticket.status !== status) return false;
    if (category && ticket.category !== category) return false;
    return true;
  });

  return (
    <div className="soft" style={{ background: "var(--color-card)", borderRadius: "var(--r-card)", padding: "var(--space-6)" }}>
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
        <div>
          <h4 style={{ margin: "0 0 4px" }}>Tickets para a Invent</h4>
          <div style={{ fontSize: 13, opacity: 0.6 }}>
            {visible.length === 1 ? "1 ticket" : `${visible.length} tickets`} com Enviar pra Invent marcado.
          </div>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => downloadCsv(visible)}>
          Exportar CSV
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "var(--space-4)", alignItems: "center" }}>
        <FilterChip label="Todos os status" active={!status} onClick={() => setStatus("")} />
        {STATUS_ORDER.map((item) => (
          <FilterChip key={item} label={STATUS_LABELS[item]} active={status === item} onClick={() => setStatus(item)} />
        ))}
        <select
          className="input"
          aria-label="Filtrar por categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value as TicketCategory | "")}
          style={{ width: "auto", minHeight: 34, fontSize: 12 }}
        >
          <option value="">Todas as categorias</option>
          {CATEGORY_ORDER.map((item) => (
            <option key={item} value={item}>
              {CATEGORY_LABELS[item]}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p style={{ opacity: 0.6, fontSize: 14, margin: 0, padding: "var(--space-6) 0", textAlign: "center" }}>
          Nenhum ticket marcado para enviar pra Invent.
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
              <th>Status</th>
              <th title="Enviar pra Invent">Invent</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.whatsapp || ticket.email || "—"}</td>
                <td style={{ whiteSpace: "nowrap" }}>{CATEGORY_LABELS[ticket.category]}</td>
                <td style={{ maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ticket.description}
                </td>
                <td>{ticket.assignee?.name ?? "—"}</td>
                <td style={{ whiteSpace: "nowrap" }}>{formatDate(ticket.created_at)}</td>
                <td style={{ whiteSpace: "nowrap" }}>{STATUS_LABELS[ticket.status]}</td>
                <td>
                  <SendToInventToggle
                    ticketId={ticket.id}
                    value={ticket.send_to_invent}
                    canEdit={canEdit}
                    compact
                    onUpdated={(next) => {
                      if (!next) setHidden((current) => [...current, ticket.id]);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className="btn"
      onClick={onClick}
      style={{
        fontSize: 12,
        padding: "6px 12px",
        background: active ? "var(--color-accent)" : "var(--color-neutral-100)",
        color: active ? "#ffffff" : "var(--color-text)",
        borderRadius: "var(--r-sm)",
      }}
    >
      {label}
    </button>
  );
}
