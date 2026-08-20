"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/lib/actions/settings";
import { ROLE_DESCRIPTION, ROLE_LABELS, ROLE_ORDER, type ProfileRole } from "@/lib/roles";

export type UserRow = {
  id: string;
  name: string;
  role: ProfileRole;
  isMe: boolean;
};

export function UsersTable({ users }: { users: UserRow[] }) {
  return (
    <div className="soft" style={{ background: "#ffffff", borderRadius: "var(--r-card)", padding: "var(--space-6)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-4)" }}>
        <div>
          <h4 style={{ margin: "0 0 4px" }}>Usuários</h4>
          <div style={{ fontSize: 12, opacity: 0.55 }}>
            {users.length} {users.length === 1 ? "usuário" : "usuários"} · admin controla os níveis
          </div>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Nível</th>
            <th>Permissões</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                {u.name}
                {u.isMe && <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.55 }}>(você)</span>}
              </td>
              <td>
                <RoleSelect userId={u.id} value={u.role} isMe={u.isMe} />
              </td>
              <td style={{ fontSize: 12, opacity: 0.65 }}>{ROLE_DESCRIPTION[u.role]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: "var(--space-4)",
          padding: "var(--space-3) var(--space-4)",
          background: "var(--color-neutral-100)",
          borderRadius: "var(--r-sm)",
          fontSize: 12,
          opacity: 0.75,
        }}
      >
        Pra convidar novos usuários, adicione em <strong>Supabase Dashboard → Authentication → Users → Add user</strong>. Novos
        usuários entram como <strong>Membro</strong> por padrão.
      </div>
    </div>
  );
}

function RoleSelect({ userId, value, isMe }: { userId: string; value: ProfileRole; isMe: boolean }) {
  const [current, setCurrent] = useState<ProfileRole>(value);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <select
        value={current}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as ProfileRole;
          setCurrent(next);
          setError(null);
          startTransition(async () => {
            try {
              await updateUserRole(userId, next);
              router.refresh();
            } catch (err) {
              setCurrent(value);
              setError(err instanceof Error ? err.message : "Erro");
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
        {ROLE_ORDER.map((r) => (
          <option key={r} value={r} disabled={isMe && r !== "admin"}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize: 11, color: "var(--color-accent-700)" }}>{error}</span>}
    </div>
  );
}
