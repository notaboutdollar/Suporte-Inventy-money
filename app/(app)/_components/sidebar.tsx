"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { logout } from "@/lib/actions/auth";
import { InventMoneyLogo } from "@/app/_components/logo";
import { ROLE_LABELS, type ProfileRole } from "@/lib/roles";

const NAV = [
  { href: "/", label: "Dashboard", icon: <IconDashboard /> },
  { href: "/historico", label: "Histórico", icon: <IconClock /> },
  { href: "/suporte", label: "Suporte", icon: <IconLifeBuoy /> },
  { href: "/configuracoes", label: "Configurações", icon: <IconSettings /> },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Sidebar({ name, role }: { name: string; role: ProfileRole }) {
  const pathname = usePathname();

  return (
    <aside
      className="soft"
      style={{
        width: 262,
        flex: "none",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
        background: "#ffffff",
        padding: "var(--space-6) var(--space-4)",
        borderRadius: "0 var(--r-card) var(--r-card) 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", padding: "0 var(--space-2)" }}>
        <InventMoneyLogo size={52} />
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {NAV.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return <NavItem key={item.href} href={item.href} label={item.label} icon={item.icon} active={active} />;
        })}
      </nav>

      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <details>
          <summary
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              paddingTop: "var(--space-2)",
              borderTop: "1px solid var(--color-neutral-200)",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "var(--r-pill)",
                background: "var(--color-accent-200)",
                color: "var(--color-accent-800)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: 13,
                flex: "none",
              }}
            >
              {initials(name)}
            </div>
            <div style={{ lineHeight: 1.2, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
              <div style={{ fontSize: 11, opacity: 0.55 }}>{ROLE_LABELS[role]}</div>
            </div>
            <IconChevronDown style={{ marginLeft: "auto", opacity: 0.5 }} />
          </summary>
          <form action={logout} style={{ marginTop: "var(--space-2)" }}>
            <button className="btn btn-secondary btn-block" type="submit" style={{ fontSize: 13, marginTop: 0 }}>
              Sair
            </button>
          </form>
        </details>

        <div style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.55, fontSize: 11 }}>
          <div
            style={{ width: 10, height: 10, borderRadius: 3, background: "var(--color-text)", flex: "none" }}
          />
          <span>
            Gerenciado por <strong>NIDO</strong>
          </span>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  const style: CSSProperties = active
    ? { background: "var(--color-accent)", color: "#ffffff", borderRadius: "var(--r-sm)" }
    : { background: "transparent", color: "var(--color-neutral-700)", borderRadius: "var(--r-sm)" };

  return (
    <Link href={href} className="btn btn-block" style={style}>
      <span style={{ marginRight: 10, display: "inline-flex" }}>{icon}</span>
      {label}
      <IconChevronRight style={{ marginLeft: "auto", opacity: 0.55 }} />
    </Link>
  );
}

/* — Icons (Lucide-style inline SVGs from the design) — */

function IconDashboard() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7.5" height="9" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="5.5" rx="2" />
      <rect x="13.5" y="11.5" width="7.5" height="9.5" rx="2" />
      <rect x="3" y="15" width="7.5" height="6" rx="2" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}
function IconLifeBuoy() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3.5" />
      <line x1="5" y1="5" x2="8.3" y2="8.3" />
      <line x1="15.7" y1="15.7" x2="19" y2="19" />
      <line x1="19" y1="5" x2="15.7" y2="8.3" />
      <line x1="8.3" y1="15.7" x2="5" y2="19" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15H4.4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 11.5 4h.1a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.1a2 2 0 1 1 0 4h-.2Z" />
    </svg>
  );
}
function IconChevronRight({ style }: { style?: CSSProperties }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}
function IconChevronDown({ style }: { style?: CSSProperties }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
