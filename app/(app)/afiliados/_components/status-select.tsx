"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAffiliateStatus } from "@/lib/actions/affiliates";
import { STATUS_LABELS, STATUS_ORDER, STATUS_TAG_STYLE, type AffiliateStatus } from "@/lib/affiliates";

export function StatusSelect({ affiliateId, value }: { affiliateId: string; value: AffiliateStatus }) {
  const [current, setCurrent] = useState<AffiliateStatus>(value);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const style = STATUS_TAG_STYLE[current];

  return (
    <select
      value={current}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as AffiliateStatus;
        setCurrent(next);
        startTransition(async () => {
          try {
            await updateAffiliateStatus(affiliateId, next);
            router.refresh();
          } catch {
            setCurrent(value);
          }
        });
      }}
      style={{
        border: `1px solid ${style.border}`,
        background: "transparent",
        color: style.color,
        borderRadius: "var(--r-sm)",
        padding: "4px 22px 4px 8px",
        fontSize: 12,
        fontWeight: 600,
        cursor: pending ? "wait" : "pointer",
        font: "inherit",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(style.color)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 6px center",
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
