"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_TAG_STYLE,
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
  canEdit,
}: {
  tickets: Ticket[];
  profiles: Profile[];
  activeStatus?: TicketStatus;
  canEdit: boolean;
}) {
  const modalRef = useRef<TicketModalHandle>(null);

  return (
    <>
      {canEdit && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-6)" }}>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => modalRef.current?.openCreate()}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Novo ticket
          </button>
        </div>
      )}

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
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const tag = STATUS_TAG_STYLE[t.status];
                return (
                  <tr
                    key={t.id}
                    onClick={canEdit ? () => modalRef.current?.openEdit(t) : undefined}
                    style={{ cursor: canEdit ? "pointer" : "default" }}
                  >
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
                    <td style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.description}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {canEdit ? (
                        <AssigneeSelect ticketId={t.id} value={t.assignee_id} profiles={profiles} />
                      ) : (
                        <span style={{ fontSize: 13 }}>{t.assignee?.name ?? "—"}</span>
                      )}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(t.created_at)}</td>
                    <td style={{ opacity: 0.65, whiteSpace: "nowrap" }}>{elapsed(t.created_at)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {canEdit ? (
                        <StatusSelect ticketId={t.id} value={t.status} />
                      ) : (
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
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {canEdit && <TicketModal ref={modalRef} profiles={profiles} />}
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
