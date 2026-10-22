"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateAffiliateStatus } from "@/lib/actions/affiliates";
import { STATUS_LABELS, STATUS_ORDER, STATUS_TAG_STYLE, type AffiliateStatus } from "@/lib/affiliates";

export function StatusSelect({ affiliateId, value }: { affiliateId: string; value: AffiliateStatus }) {
  const [current, setCurrent] = useState<AffiliateStatus>(value);
  const seq = useRef(0);
  const router = useRouter();
  const style = STATUS_TAG_STYLE[current];

  return (
    <select
      value={current}
      onChange={(e) => {
        const next = e.target.value as AffiliateStatus;
        const prev = current;
        const token = ++seq.current;
        setCurrent(next);
        void updateAffiliateStatus(affiliateId, next)
          .then(() => {
            if (token === seq.current) router.refresh();
          })
          .catch(() => {
            if (token === seq.current) setCurrent(prev);
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
        cursor: "pointer",
        font: "inherit",
        appearance: "none",
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%239b9797' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
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
