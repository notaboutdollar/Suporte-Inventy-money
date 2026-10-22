"use client";

import { useEffect, useState } from "react";
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ORDER, type TicketCategory } from "@/lib/tickets";

type Range = "week" | "month" | "all";

const RANGE_LABEL: Record<Range, string> = {
  week: "Semana",
  month: "Mês",
  all: "Total",
};

export function CategoryChart({
  initial,
  series,
}: {
  initial: Range;
  series: Record<Range, { counts: Record<TicketCategory, number>; max: number }>;
}) {
  const [range, setRange] = useState<Range>(initial);
  const { counts, max } = series[range];

  useEffect(() => {
    function onPop() {
      const value = new URLSearchParams(window.location.search).get("catRange");
      setRange(value === "month" || value === "all" ? value : "week");
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function select(next: Range) {
    setRange(next);
    const url = next === "week" ? "/" : `/?catRange=${next}`;
    window.history.replaceState(null, "", url);
  }

  return (
    <div
      className="soft"
      style={{
        background: "var(--color-card)",
        borderRadius: "var(--r-card)",
        padding: "var(--space-6)",
        minWidth: 0,
        flex: "1 1 460px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "var(--space-4)",
          flexWrap: "wrap",
          marginBottom: "var(--space-6)",
        }}
      >
        <div>
          <h4 style={{ margin: "0 0 2px" }}>Ocorrências por categoria</h4>
          <div style={{ fontSize: 12, opacity: 0.5 }}>{RANGE_LABEL[range]}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {(["week", "month", "all"] as Range[]).map((r) => {
            const active = r === range;
            return (
              <button
                key={r}
                type="button"
                className="btn"
                onClick={() => select(r)}
                style={{
                  fontSize: 12,
                  padding: "6px 12px",
                  background: active ? "var(--color-accent)" : "var(--color-neutral-100)",
                  color: active ? "#ffffff" : "var(--color-text)",
                  borderRadius: "var(--r-sm)",
                }}
              >
                {RANGE_LABEL[r]}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200 }}>
        {CATEGORY_ORDER.map((cat) => {
          const count = counts[cat];
          const height = (count / max) * 180;
          return (
            <div
              key={cat}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                flex: 1,
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: CATEGORY_COLORS[cat] }}>{count || ""}</div>
              <div
                style={{
                  width: "100%",
                  height: Math.max(4, height),
                  borderRadius: "var(--r-sm)",
                  background: CATEGORY_COLORS[cat],
                  opacity: count === 0 ? 0.15 : 1,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  opacity: 0.6,
                  textAlign: "center",
                  lineHeight: 1.1,
                  minHeight: 22,
                }}
              >
                {CATEGORY_LABELS[cat]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
