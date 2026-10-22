"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const seq = useRef(0);
  const router = useRouter();

  return (
    <select
      value={current ?? ""}
      onChange={(e) => {
        const next = e.target.value || null;
        const prev = current;
        const token = ++seq.current;
        setCurrent(next);
        void updateTicketAssignee(ticketId, next)
          .then(() => {
            if (token === seq.current) router.refresh();
          })
          .catch(() => {
            if (token === seq.current) setCurrent(prev);
          });
      }}
      style={{
        border: "1px solid var(--color-neutral-200)",
        background: "transparent",
        borderRadius: "var(--r-sm)",
        padding: "4px 22px 4px 8px",
        fontSize: 13,
        cursor: "pointer",
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
