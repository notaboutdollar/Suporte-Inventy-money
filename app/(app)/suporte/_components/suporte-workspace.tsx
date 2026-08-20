"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  type Profile,
  type Ticket,
  type TicketStatus,
} from "@/lib/tickets";
import { AssigneeSelect } from "./assignee-select";
import { StatusSelect } from "./status-select";
import { TicketModal, type TicketModalHandle } from "./new-ticket-modal";

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

export function SuporteWorkspace({
  tickets,
  profiles,
  activeStatus,
}: {
  tickets: Ticket[];
  profiles: Profile[];
  activeStatus?: TicketStatus;
}) {
  const modalRef = useRef<TicketModalHandle>(null);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-6)" }}>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => modalRef.current?.openCreate()}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Novo ticket
        </button>
      </div>

      <div
        className="soft"
        style={{ background: "#ffffff", borderRadius: "var(--r-card)", padding: "var(--space-6)" }}
      >
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td>{t.whatsapp || t.email || "—"}</td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
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
                  <td>
                    <AssigneeSelect ticketId={t.id} value={t.assignee_id} profiles={profiles} />
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDate(t.created_at)}</td>
                  <td style={{ opacity: 0.65, whiteSpace: "nowrap" }}>{elapsed(t.created_at)}</td>
                  <td>
                    <StatusSelect ticketId={t.id} value={t.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => modalRef.current?.openEdit(t)}
                      aria-label="Editar"
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "var(--color-neutral-600)",
                        padding: 4,
                        display: "inline-flex",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <TicketModal ref={modalRef} profiles={profiles} />
    </>
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
