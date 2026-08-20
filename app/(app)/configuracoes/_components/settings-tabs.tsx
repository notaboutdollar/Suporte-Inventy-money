"use client";

import { useState, type ReactNode } from "react";

export function SettingsTabs({
  tabs,
}: {
  tabs: { key: string; label: string; content: ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {tabs.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              className="btn"
              onClick={() => setActive(t.key)}
              style={{
                fontSize: 13,
                padding: "8px 16px",
                background: isActive ? "var(--color-accent)" : "var(--color-neutral-100)",
                color: isActive ? "#ffffff" : "var(--color-text)",
                borderRadius: "var(--r-sm)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div>{activeTab?.content}</div>
    </div>
  );
}
