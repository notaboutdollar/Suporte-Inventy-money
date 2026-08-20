"use client";

import { useRef, useState, useTransition } from "react";
import { createTicket } from "@/lib/actions/tickets";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
  type Profile,
} from "@/lib/tickets";

function localNowInputValue() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function NewTicketModal({ profiles }: { profiles: Profile[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function open() {
    setError(null);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await createTicket(formData);
        formRef.current?.reset();
        close();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao criar ticket");
      }
    });
  }

  return (
    <>
      <button className="btn btn-primary" type="button" onClick={open}>
        <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Novo ticket
      </button>

      <dialog
        ref={dialogRef}
        style={{
          border: "none",
          borderRadius: "var(--r-card)",
          padding: 0,
          background: "transparent",
          maxWidth: 540,
          width: "calc(100vw - 32px)",
        }}
      >
        <div
          className="soft"
          style={{
            background: "#ffffff",
            borderRadius: "var(--r-card)",
            padding: "var(--space-6)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
            maxHeight: "calc(100vh - 32px)",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h4 style={{ margin: 0 }}>Novo ticket</h4>
            <button
              type="button"
              onClick={close}
              aria-label="Fechar"
              style={{
                border: "none",
                background: "transparent",
                fontSize: 20,
                lineHeight: 1,
                cursor: "pointer",
                color: "var(--color-neutral-600)",
                padding: 4,
              }}
            >
              ×
            </button>
          </div>

          <form
            ref={formRef}
            action={onSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
          >
            <div className="field">
              <label htmlFor="telegram_handle">
                Handle do Telegram <span style={{ color: "var(--color-accent)" }}>*</span>
              </label>
              <input
                className="input"
                id="telegram_handle"
                name="telegram_handle"
                type="text"
                placeholder="@usuario"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">E-mail da conta</label>
              <input className="input" id="email" name="email" type="email" placeholder="trainer@email.com" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div className="field">
                <label htmlFor="assignee_id">Responsável</label>
                <select className="input" id="assignee_id" name="assignee_id" defaultValue="">
                  <option value="">Não atribuído</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="created_at">Data de abertura</label>
                <input
                  className="input"
                  id="created_at"
                  name="created_at"
                  type="datetime-local"
                  defaultValue={localNowInputValue()}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="category">Categoria</label>
              <select className="input" id="category" name="category" required defaultValue="outro">
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="description">
                Descrição <span style={{ color: "var(--color-accent)" }}>*</span>
              </label>
              <textarea className="input" id="description" name="description" rows={3} required />
            </div>

            <div className="field">
              <label htmlFor="notes">Dados do ticket</label>
              <textarea
                className="input"
                id="notes"
                name="notes"
                rows={2}
                placeholder="Cole email, ID, dados extras..."
              />
            </div>

            <div className="field">
              <label htmlFor="status">Status inicial</label>
              <select className="input" id="status" name="status" defaultValue="solicitado">
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
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
              <button className="btn btn-primary" type="submit" disabled={pending} style={{ flex: 1, justifyContent: "center" }}>
                {pending ? "Criando..." : "Criar ticket"}
              </button>
              <button className="btn btn-secondary" type="button" onClick={close} disabled={pending}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <style>{`
        dialog::backdrop {
          background: color-mix(in srgb, #2d2b2b 45%, transparent);
          backdrop-filter: blur(2px);
        }
      `}</style>
    </>
  );
}
