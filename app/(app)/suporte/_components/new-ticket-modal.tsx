"use client";

import { useImperativeHandle, useRef, useState, useTransition, forwardRef } from "react";
import { createTicket, updateTicket } from "@/lib/actions/tickets";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
  type Profile,
  type Ticket,
} from "@/lib/tickets";

function localInputValue(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export type TicketModalHandle = {
  openCreate: () => void;
  openEdit: (ticket: Ticket) => void;
};

export const TicketModal = forwardRef<TicketModalHandle, { profiles: Profile[] }>(function TicketModal(
  { profiles },
  ref
) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const isEdit = ticket !== null;

  useImperativeHandle(ref, () => ({
    openCreate() {
      setTicket(null);
      setError(null);
      dialogRef.current?.showModal();
    },
    openEdit(t) {
      setTicket(t);
      setError(null);
      dialogRef.current?.showModal();
    },
  }));

  function close() {
    dialogRef.current?.close();
  }

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (isEdit && ticket) {
          await updateTicket(ticket.id, formData);
        } else {
          await createTicket(formData);
        }
        formRef.current?.reset();
        close();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao salvar ticket");
      }
    });
  }

  return (
    <>
      <dialog
        ref={dialogRef}
        className="soft"
        key={ticket?.id ?? "new"}
        style={{
          border: "none",
          borderRadius: "var(--r-card)",
          padding: "var(--space-6)",
          background: "#ffffff",
          color: "var(--color-text)",
          maxWidth: 540,
          width: "calc(100vw - 32px)",
          maxHeight: "calc(100vh - 32px)",
          margin: "auto",
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h4 style={{ margin: 0 }}>{isEdit ? "Editar ticket" : "Novo ticket"}</h4>
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
              <label htmlFor="whatsapp">
                WhatsApp <span style={{ color: "var(--color-accent)" }}>*</span>
              </label>
              <input
                className="input"
                id="whatsapp"
                name="whatsapp"
                type="text"
                placeholder="+55 11 98765-4321"
                required
                defaultValue={ticket?.whatsapp ?? ""}
              />
            </div>

            <div className="field">
              <label htmlFor="email">E-mail da conta</label>
              <input
                className="input"
                id="email"
                name="email"
                type="email"
                placeholder="trainer@email.com"
                defaultValue={ticket?.email ?? ""}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <div className="field">
                <label htmlFor="assignee_id">Responsável</label>
                <select
                  className="input"
                  id="assignee_id"
                  name="assignee_id"
                  defaultValue={ticket?.assignee_id ?? ""}
                >
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
                  defaultValue={localInputValue(ticket?.created_at)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="category">Categoria</label>
              <select
                className="input"
                id="category"
                name="category"
                required
                defaultValue={ticket?.category ?? "outro"}
              >
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
              <textarea
                className="input"
                id="description"
                name="description"
                rows={3}
                required
                defaultValue={ticket?.description ?? ""}
              />
            </div>

            <div className="field">
              <label htmlFor="notes">Dados do ticket</label>
              <textarea
                className="input"
                id="notes"
                name="notes"
                rows={2}
                placeholder="Cole email, ID, dados extras..."
                defaultValue={ticket?.extra_data?.notes ?? ""}
              />
            </div>

            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                className="input"
                id="status"
                name="status"
                defaultValue={ticket?.status ?? "solicitado"}
              >
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
              <button
                className="btn btn-primary"
                type="submit"
                disabled={pending}
                style={{ flex: 1, justifyContent: "center" }}
              >
                {pending ? "Salvando..." : isEdit ? "Salvar" : "Criar ticket"}
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
});
