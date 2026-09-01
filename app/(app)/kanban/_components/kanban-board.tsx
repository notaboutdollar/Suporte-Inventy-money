"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAffiliateStatus } from "@/lib/actions/affiliates";
import {
  ENGAGEMENT_LABELS,
  ENGAGEMENT_STYLE,
  NICHE_LABELS,
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_TAG_STYLE,
  type Affiliate,
  type AffiliateStatus,
} from "@/lib/affiliates";

function isFollowUpToday(iso: string | null) {
  if (!iso) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d.getTime() <= today.getTime();
}

export function KanbanBoard({
  affiliates,
  canEdit,
}: {
  affiliates: Affiliate[];
  canEdit: boolean;
}) {
  const [items, setItems] = useState<Affiliate[]>(affiliates);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<AffiliateStatus | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function onDropColumn(status: AffiliateStatus) {
    if (!dragId || !canEdit) return;
    const current = items.find((a) => a.id === dragId);
    setOverCol(null);
    setDragId(null);
    if (!current || current.status === status) return;

    const prev = items;
    setItems(items.map((a) => (a.id === dragId ? { ...a, status } : a)));
    setPendingId(dragId);

    startTransition(async () => {
      try {
        await updateAffiliateStatus(current.id, status);
        router.refresh();
      } catch {
        setItems(prev);
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 12, minHeight: 500 }}>
      {STATUS_ORDER.map((status) => {
        const cards = items.filter((a) => a.status === status);
        const style = STATUS_TAG_STYLE[status];
        const isOver = overCol === status;

        return (
          <div
            key={status}
            onDragOver={(e) => {
              if (!canEdit || !dragId) return;
              e.preventDefault();
              if (overCol !== status) setOverCol(status);
            }}
            onDragLeave={() => {
              if (overCol === status) setOverCol(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              onDropColumn(status);
            }}
            style={{
              minWidth: 280,
              flex: "0 0 280px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              background: isOver ? "var(--color-accent-100)" : "transparent",
              borderRadius: "var(--r-card)",
              padding: 4,
              transition: "background 120ms ease",
            }}
          >
            <div
              className="soft"
              style={{
                background: "#ffffff",
                borderTop: `3px solid ${style.dot}`,
                borderRadius: "var(--r-card)",
                padding: "var(--space-3) var(--space-4)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: style.color }}>
                {STATUS_LABELS[status]}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  opacity: 0.55,
                  background: "var(--color-neutral-100)",
                  borderRadius: "var(--r-pill)",
                  padding: "2px 8px",
                }}
              >
                {cards.length}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 40 }}>
              {cards.map((card) => (
                <KanbanCard
                  key={card.id}
                  affiliate={card}
                  draggable={canEdit}
                  onDragStart={() => setDragId(card.id)}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverCol(null);
                  }}
                  pending={pendingId === card.id}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({
  affiliate,
  draggable,
  onDragStart,
  onDragEnd,
  pending,
}: {
  affiliate: Affiliate;
  draggable: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  pending: boolean;
}) {
  const eng = affiliate.engagement ? ENGAGEMENT_STYLE[affiliate.engagement] : null;
  const followUp = isFollowUpToday(affiliate.follow_up_at);

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className="soft"
      style={{
        background: "#ffffff",
        borderRadius: "var(--r-card)",
        padding: "var(--space-3) var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        cursor: draggable ? "grab" : "default",
        opacity: pending ? 0.55 : 1,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{affiliate.name}</div>
      {affiliate.handle && (
        <div style={{ fontSize: 12, opacity: 0.55 }}>{affiliate.handle}</div>
      )}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
        {affiliate.niche && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              background: "var(--color-neutral-100)",
              color: "var(--color-text)",
              borderRadius: "var(--r-sm)",
              padding: "2px 8px",
            }}
          >
            {NICHE_LABELS[affiliate.niche]}
          </span>
        )}
        {eng && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: eng.color,
              background: eng.bg,
              borderRadius: "var(--r-sm)",
              padding: "2px 8px",
            }}
          >
            {ENGAGEMENT_LABELS[affiliate.engagement!]}
          </span>
        )}
      </div>
      {followUp && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            color: "var(--color-accent-700)",
            fontWeight: 600,
            marginTop: 2,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2v2M18 2v2" />
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M3 10h18" />
          </svg>
          Follow-up hoje
        </div>
      )}
    </div>
  );
}
