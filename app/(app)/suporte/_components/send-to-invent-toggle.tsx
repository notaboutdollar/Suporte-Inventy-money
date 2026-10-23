"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateTicketSendToInvent } from "@/lib/actions/tickets";

export function SendToInventToggle({
  ticketId,
  value,
  canEdit,
  compact = false,
  onUpdated,
}: {
  ticketId?: string;
  value: boolean;
  canEdit: boolean;
  compact?: boolean;
  onUpdated?: (next: boolean) => void;
}) {
  const [current, setCurrent] = useState(value);
  const seq = useRef(0);
  const router = useRouter();

  return (
    <label
      title="Enviar pra Invent"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        cursor: canEdit ? "pointer" : "default",
      }}
    >
      <input
        type="checkbox"
        name="send_to_invent"
        checked={current}
        disabled={!canEdit}
        aria-label="Enviar pra Invent"
        onChange={(e) => {
          if (!canEdit) return;
          const next = e.target.checked;
          const prev = current;
          const token = ++seq.current;
          setCurrent(next);
          if (!ticketId) return;
          void updateTicketSendToInvent(ticketId, next)
            .then(() => {
              if (token !== seq.current) return;
              onUpdated?.(next);
              router.refresh();
            })
            .catch(() => {
              if (token === seq.current) setCurrent(prev);
            });
        }}
        style={{ width: 16, height: 16, accentColor: "var(--color-accent)", cursor: canEdit ? "pointer" : "default" }}
      />
      {compact ? null : "Enviar pra Invent"}
    </label>
  );
}
