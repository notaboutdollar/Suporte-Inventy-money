"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveUser, updateUserRole } from "@/lib/actions/settings";
import { ROLE_DESCRIPTION, ROLE_LABELS, ROLE_ORDER, type ProfileRole } from "@/lib/roles";

export type UserRow = {
  id: string;
  name: string;
  role: ProfileRole;
  approved: boolean;
  isMe: boolean;
};

export function UsersTable({ users }: { users: UserRow[] }) {
  const pending = users.filter((u) => !u.approved);
  const approved = users.filter((u) => u.approved);
  const approveModalRef = useRef<HTMLDialogElement>(null);
  const [pendingUser, setPendingUser] = useState<UserRow | null>(null);

  function openApprove(u: UserRow) {
    setPendingUser(u);
    approveModalRef.current?.showModal();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {pending.length > 0 && (
        <div className="soft" style={{ background: "#ffffff", borderRadius: "var(--r-card)", padding: "var(--space-6)" }}>
          <div style={{ marginBottom: "var(--space-4)" }}>
            <h4 style={{ margin: "0 0 4px" }}>Aguardando aprovação</h4>
            <div style={{ fontSize: 12, opacity: 0.55 }}>
              {pending.length} {pending.length === 1 ? "cadastro pendente" : "cadastros pendentes"}
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn btn-primary" type="button" onClick={() => openApprove(u)} style={{ fontSize: 12, padding: "6px 14px" }}>
                      Aprovar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="soft" style={{ background: "#ffffff", borderRadius: "var(--r-card)", padding: "var(--space-6)" }}>
        <div style={{ marginBottom: "var(--space-4)" }}>
          <h4 style={{ margin: "0 0 4px" }}>Usuários ativos</h4>
          <div style={{ fontSize: 12, opacity: 0.55 }}>
            {approved.length} {approved.length === 1 ? "usuário" : "usuários"}
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
            {approved.map((u) => (
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
      </div>

      <ApproveDialog ref={approveModalRef} user={pendingUser} onDone={() => setPendingUser(null)} />
    </div>
  );
}

function ApproveDialog({
  ref,
  user,
  onDone,
}: {
  ref: React.RefObject<HTMLDialogElement | null>;
  user: UserRow | null;
  onDone: () => void;
}) {
  const [role, setRole] = useState<ProfileRole>("member");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit() {
    if (!user) return;
    setError(null);
    setPending(true);
    try {
      await approveUser(user.id, role);
      ref.current?.close();
      onDone();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao aprovar");
    } finally {
      setPending(false);
    }
  }

  return (
    <dialog
      ref={ref}
      className="soft"
      style={{
        border: "none",
        borderRadius: "var(--r-card)",
        padding: "var(--space-6)",
        background: "#ffffff",
        color: "var(--color-text)",
        maxWidth: 420,
        width: "calc(100vw - 32px)",
        margin: "auto",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div>
          <h4 style={{ margin: "0 0 4px" }}>Aprovar {user?.name}</h4>
          <div style={{ fontSize: 13, opacity: 0.65 }}>Escolha o nível de permissão pra este usuário.</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {ROLE_ORDER.map((r) => (
            <label
              key={r}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-3)",
                borderRadius: "var(--r-sm)",
                border: `1px solid ${role === r ? "var(--color-accent)" : "var(--color-neutral-200)"}`,
                background: role === r ? "var(--color-accent-100)" : "transparent",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                style={{ margin: 0 }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{ROLE_LABELS[r]}</div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>{ROLE_DESCRIPTION[r]}</div>
              </div>
            </label>
          ))}
        </div>

        {error && (
          <div
            style={{
              fontSize: 13,
              color: "var(--color-accent-700)",
              background: "var(--color-accent-100)",
              borderRadius: "var(--r-sm)",
              padding: "var(--space-2) var(--space-3)",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)" }}>
          <button
            className="btn btn-primary"
            type="button"
            onClick={submit}
            disabled={pending}
            style={{ flex: 1, justifyContent: "center" }}
          >
            {pending ? "Aprovando..." : "Aprovar"}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => ref.current?.close()} disabled={pending}>
            Cancelar
          </button>
        </div>
      </div>
    </dialog>
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
