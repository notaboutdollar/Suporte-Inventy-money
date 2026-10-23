"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTicketStatus } from "@/lib/actions/tickets";
import { STATUS_LABELS, STATUS_ORDER, STATUS_TAG_STYLE, type TicketStatus } from "@/lib/tickets";

export function StatusSelect({
  ticketId,
  value,
  onUpdated,
}: {
  ticketId: string;
  value: TicketStatus;
  onUpdated?: (next: TicketStatus) => void;
}) {
  const [current, setCurrent] = useState<TicketStatus>(value);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);
  const router = useRouter();
  const style = STATUS_TAG_STYLE[current];

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 4, maxWidth: 190 }}>
      <select
        value={current}
        aria-invalid={error ? true : undefined}
        onChange={(e) => {
          const next = e.target.value as TicketStatus;
          const prev = current;
          const token = ++seq.current;
          setCurrent(next);
          setError(null);
          void updateTicketStatus(ticketId, next)
            .then((result) => {
              if (token !== seq.current) return;
              if (result?.error) {
                setCurrent(prev);
                setError(result.error);
                return;
              }
              onUpdated?.(next);
              router.refresh();
            })
            .catch((err) => {
              if (token !== seq.current) return;
              setCurrent(prev);
              setError(err instanceof Error ? err.message : "Não foi possível mudar o status.");
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
          cursor: "pointer",
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
      {error ? (
        <span role="alert" style={{ fontSize: 11, lineHeight: 1.3, color: "var(--color-accent-700)", whiteSpace: "normal" }}>
          {error}
        </span>
      ) : null}
    </span>
  );
}
