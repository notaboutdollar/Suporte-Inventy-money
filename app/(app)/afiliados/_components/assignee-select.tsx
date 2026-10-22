"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateAffiliateAssignee } from "@/lib/actions/affiliates";
import type { Profile } from "@/lib/tickets";

export function AssigneeSelect({
  affiliateId,
  value,
  profiles,
}: {
  affiliateId: string;
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
        void updateAffiliateAssignee(affiliateId, next)
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
        color: "var(--color-text)",
        borderRadius: "var(--r-sm)",
        padding: "4px 22px 4px 8px",
        fontSize: 12,
        cursor: "pointer",
        font: "inherit",
        appearance: "none",
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 6px center",
      }}
    >
      <option value="">— sem responsável</option>
      {profiles.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name.split(" ")[0]}
        </option>
      ))}
    </select>
  );
}
