"use client";

import { useState, useTransition } from "react";
import { updateTicketStatus } from "@/lib/actions/tickets";
import { STATUS_LABELS, STATUS_ORDER, STATUS_TAG_STYLE, type TicketStatus } from "@/lib/tickets";

export function StatusSelect({ ticketId, value }: { ticketId: string; value: TicketStatus }) {
  const [current, setCurrent] = useState<TicketStatus>(value);
  const [pending, startTransition] = useTransition();
  const style = STATUS_TAG_STYLE[current];

  return (
    <select
      value={current}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as TicketStatus;
        setCurrent(next);
        startTransition(async () => {
          try {
            await updateTicketStatus(ticketId, next);
          } catch {
            setCurrent(value);
          }
        });
      }}
      style={{
        border: `1px solid ${style.border}`,
        color: style.color,
        background: style.bg,
        borderRadius: "var(--r-sm)",
        padding: "4px 26px 4px 12px",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.02,
        cursor: pending ? "wait" : "pointer",
        font: "inherit",
        appearance: "none",
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 8px center",
      }}
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
