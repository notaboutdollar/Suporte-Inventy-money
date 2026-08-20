"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateOwnProfile } from "@/lib/actions/settings";
import { ROLE_LABELS, type ProfileRole } from "@/lib/roles";

export function ProfileForm({
  email,
  name,
  role,
}: {
  email: string;
  name: string;
  role: ProfileRole;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setMessage(null);
    setPending(true);
    try {
      await updateOwnProfile(formData);
      setMessage({ type: "ok", text: "Perfil atualizado." });
      router.refresh();
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Erro ao salvar" });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="soft" style={{ background: "#ffffff", borderRadius: "var(--r-card)", padding: "var(--space-6)" }}>
      <h4 style={{ margin: "0 0 var(--space-4)" }}>Meu perfil</h4>
      <form ref={formRef} action={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", maxWidth: 480 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
          <div className="field">
            <label htmlFor="name">Nome</label>
            <input className="input" id="name" name="name" type="text" required defaultValue={name} />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input className="input" id="email" type="email" defaultValue={email} disabled />
          </div>
        </div>

        <div className="field">
          <label>Nível</label>
          <div
            style={{
              padding: "8px 12px",
              fontSize: 13,
              background: "var(--color-neutral-100)",
              borderRadius: "var(--r-sm)",
              color: "var(--color-text)",
            }}
          >
            {ROLE_LABELS[role]}
          </div>
        </div>

        {message && (
          <div
            style={{
              fontSize: 13,
              color: message.type === "ok" ? "#166a45" : "var(--color-accent-700)",
              background: message.type === "ok" ? "#e6f6ee" : "var(--color-accent-100)",
              borderRadius: "var(--r-sm)",
              padding: "var(--space-2) var(--space-3)",
            }}
          >
            {message.text}
          </div>
        )}

        <div>
          <button className="btn btn-primary" type="submit" disabled={pending} style={{ justifyContent: "center" }}>
            {pending ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
