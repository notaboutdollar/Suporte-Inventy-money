"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ENGAGEMENT_LABELS,
  ENGAGEMENT_STYLE,
  NICHE_LABELS,
  NICHE_ORDER,
  ORIGIN_LABELS,
  ORIGIN_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_TAG_STYLE,
  type Affiliate,
  type AffiliateNiche,
  type AffiliateOrigin,
  type AffiliateStatus,
} from "@/lib/affiliates";
import { SocialLinkIcons } from "../../_components/social-links";
import type { Profile } from "@/lib/tickets";
import { AfiliadoModal, type AfiliadoModalHandle } from "./afiliado-modal";
import { StatusSelect } from "./status-select";
import { AssigneeSelect } from "./assignee-select";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(iso)
  );
}

type Filters = {
  status: AffiliateStatus | "";
  niche: AffiliateNiche | "";
  origin: AffiliateOrigin | "";
  q: string;
};

export function AfiliadosWorkspace({
  affiliates,
  profiles,
  canEdit,
}: {
  affiliates: Affiliate[];
  profiles: Profile[];
  canEdit: boolean;
}) {
  const modalRef = useRef<AfiliadoModalHandle>(null);
  const [filters, setFilters] = useState<Filters>({ status: "", niche: "", origin: "", q: "" });

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return affiliates.filter((a) => {
      if (filters.status && a.status !== filters.status) return false;
      if (filters.niche && a.niche !== filters.niche) return false;
      if (filters.origin && a.origin !== filters.origin) return false;
      if (q) {
        const hay = `${a.name} ${a.email ?? ""} ${a.phone ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [affiliates, filters]);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--space-4)",
          flexWrap: "wrap",
          marginBottom: "var(--space-4)",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            className="input soft"
            placeholder="Buscar nome, email..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            style={{ minWidth: 240, background: "#ffffff", border: "none" }}
          />
          <select
            className="input soft"
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value as AffiliateStatus | "" })
            }
            style={{ background: "#ffffff", border: "none" }}
          >
            <option value="">Todos status</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            className="input soft"
            value={filters.niche}
            onChange={(e) => setFilters({ ...filters, niche: e.target.value as AffiliateNiche | "" })}
            style={{ background: "#ffffff", border: "none" }}
          >
            <option value="">Todos nichos</option>
            {NICHE_ORDER.map((n) => (
              <option key={n} value={n}>
                {NICHE_LABELS[n]}
              </option>
            ))}
          </select>
          <select
            className="input soft"
            value={filters.origin}
            onChange={(e) =>
              setFilters({ ...filters, origin: e.target.value as AffiliateOrigin | "" })
            }
            style={{ background: "#ffffff", border: "none" }}
          >
            <option value="">Todas origens</option>
            {ORIGIN_ORDER.map((o) => (
              <option key={o} value={o}>
                {ORIGIN_LABELS[o]}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/kanban" className="btn btn-secondary" style={{ fontSize: 13 }}>
            Kanban
          </Link>
          {canEdit && (
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => modalRef.current?.openCreate()}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Novo criador
            </button>
          )}
        </div>
      </div>

      <div
        className="soft"
        style={{
          background: "#ffffff",
          borderRadius: "var(--r-card)",
          padding: "var(--space-6)",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
          <div>
            <h4 style={{ margin: "0 0 4px" }}>Criadores</h4>
            <div style={{ fontSize: 12, opacity: 0.55 }}>
              {filtered.length} de {affiliates.length}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "var(--space-8)", opacity: 0.55 }}>
            Nenhum criador encontrado.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Redes</th>
                <th>Origem</th>
                <th>Contato</th>
                <th>1º contato</th>
                <th>Follow-up</th>
                <th>Responsável</th>
                <th>Nicho</th>
                <th>Engajamento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const eng = a.engagement ? ENGAGEMENT_STYLE[a.engagement] : null;
                return (
                  <tr
                    key={a.id}
                    onClick={canEdit ? () => modalRef.current?.openEdit(a) : undefined}
                    style={{ cursor: canEdit ? "pointer" : "default" }}
                  >
                    <td>
                      <strong>{a.name}</strong>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <SocialLinkIcons links={a.socials} size={16} />
                    </td>
                    <td style={{ fontSize: 12 }}>{a.origin ? ORIGIN_LABELS[a.origin] : "—"}</td>
                    <td style={{ fontSize: 12, opacity: 0.8 }}>{a.phone || a.email || "—"}</td>
                    <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>
                      {formatDate(a.first_contact_at)}
                    </td>
                    <td style={{ whiteSpace: "nowrap", fontSize: 12, color: "var(--color-accent)" }}>
                      {formatDate(a.follow_up_at)}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {canEdit ? (
                        <AssigneeSelect
                          affiliateId={a.id}
                          value={a.assignee_id}
                          profiles={profiles}
                        />
                      ) : (
                        <span style={{ fontSize: 12 }}>{a.assignee?.name ?? "—"}</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12 }}>{a.niche ? NICHE_LABELS[a.niche] : "—"}</td>
                    <td>
                      {eng ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: eng.color,
                            background: eng.bg,
                            borderRadius: "var(--r-sm)",
                            padding: "3px 10px",
                          }}
                        >
                          {ENGAGEMENT_LABELS[a.engagement!]}
                        </span>
                      ) : (
                        <span style={{ opacity: 0.4 }}>—</span>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {canEdit ? (
                        <StatusSelect affiliateId={a.id} value={a.status} />
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: STATUS_TAG_STYLE[a.status].color,
                            border: `1px solid ${STATUS_TAG_STYLE[a.status].border}`,
                            borderRadius: "var(--r-sm)",
                            padding: "3px 10px",
                          }}
                        >
                          {STATUS_LABELS[a.status]}
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

      {canEdit && <AfiliadoModal ref={modalRef} profiles={profiles} />}
    </>
  );
}
