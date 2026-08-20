"use client";

import { useState, useTransition } from "react";
import { updateTicketAssignee } from "@/lib/actions/tickets";
import type { Profile } from "@/lib/tickets";

export function AssigneeSelect({
  ticketId,
  value,
  profiles,
}: {
  ticketId: string;
  value: string | null;
  profiles: Profile[];
}) {
  const [current, setCurrent] = useState<string | null>(value);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={current ?? ""}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value || null;
        setCurrent(next);
        startTransition(async () => {
          try {
            await updateTicketAssignee(ticketId, next);
          } catch {
            setCurrent(value);
          }
        });
      }}
      style={{
        border: "1px solid var(--color-neutral-200)",
        background: "transparent",
        borderRadius: "var(--r-sm)",
        padding: "4px 22px 4px 8px",
        fontSize: 13,
        cursor: pending ? "wait" : "pointer",
        font: "inherit",
        color: "var(--color-text)",
        appearance: "none",
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 6px center",
      }}
    >
      <option value="">—</option>
      {profiles.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
