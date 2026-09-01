"use client";

import { useImperativeHandle, useRef, useState, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { createAffiliate, deleteAffiliate, updateAffiliate } from "@/lib/actions/affiliates";
import {
  ENGAGEMENT_LABELS,
  ENGAGEMENT_ORDER,
  NICHE_LABELS,
  NICHE_ORDER,
  ORIGIN_LABELS,
  ORIGIN_ORDER,
  SOCIAL_PLATFORM_LABELS,
  SOCIAL_PLATFORM_ORDER,
  SOCIAL_PLATFORM_PLACEHOLDERS,
  STATUS_LABELS,
  STATUS_ORDER,
  type Affiliate,
} from "@/lib/affiliates";
import type { Profile } from "@/lib/tickets";

export type AfiliadoModalHandle = {
  openCreate: () => void;
  openEdit: (a: Affiliate) => void;
};

export const AfiliadoModal = forwardRef<AfiliadoModalHandle, { profiles: Profile[] }>(
  function AfiliadoModal({ profiles }, ref) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
    const router = useRouter();

    useImperativeHandle(ref, () => ({
      openCreate: () => {
        setAffiliate(null);
        setError(null);
        formRef.current?.reset();
        dialogRef.current?.showModal();
      },
      openEdit: (a) => {
        setAffiliate(a);
        setError(null);
        dialogRef.current?.showModal();
      },
    }));

    function close() {
      dialogRef.current?.close();
    }

    async function onSubmit(formData: FormData) {
      setError(null);
      setPending(true);
      try {
        if (affiliate) {
          await updateAffiliate(affiliate.id, formData);
        } else {
          await createAffiliate(formData);
        }
        formRef.current?.reset();
        close();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao salvar");
      } finally {
        setPending(false);
      }
    }

    async function onDelete() {
      if (!affiliate) return;
      if (!confirm("Excluir este criador? Essa ação não pode ser desfeita.")) return;
      setError(null);
      setPending(true);
      try {
        await deleteAffiliate(affiliate.id);
        close();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao excluir");
      } finally {
        setPending(false);
      }
    }

    const isEdit = affiliate !== null;

    return (
      <dialog
        ref={dialogRef}
        className="soft"
        style={{
          border: "none",
          borderRadius: "var(--r-card)",
          padding: 0,
          background: "#ffffff",
          color: "var(--color-text)",
          maxWidth: 640,
          width: "calc(100vw - 32px)",
          maxHeight: "calc(100vh - 32px)",
          overflow: "auto",
          margin: "auto",
        }}
      >
        <form
          ref={formRef}
          action={onSubmit}
          style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h4 style={{ margin: "0 0 4px" }}>{isEdit ? "Editar criador" : "Novo criador"}</h4>
              <div style={{ fontSize: 13, opacity: 0.6 }}>
                {isEdit ? "Atualize os dados do criador." : "Preencha os dados iniciais do criador."}
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Fechar"
              style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 20, opacity: 0.6 }}
            >
              ×
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="name">
                Nome <span style={{ color: "var(--color-accent)" }}>*</span>
              </label>
              <input className="input" id="name" name="name" required defaultValue={affiliate?.name ?? ""} />
            </div>

            <div className="field">
              <label htmlFor="phone">Telefone</label>
              <input
                className="input"
                id="phone"
                name="phone"
                placeholder="(11) 99999-9999"
                defaultValue={affiliate?.phone ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                className="input"
                id="email"
                name="email"
                type="email"
                defaultValue={affiliate?.email ?? ""}
              />
            </div>

            <div className="field">
              <label htmlFor="origin">Origem de contato</label>
              <select className="input" id="origin" name="origin" defaultValue={affiliate?.origin ?? ""}>
                <option value="">Selecione</option>
                {ORIGIN_ORDER.map((o) => (
                  <option key={o} value={o}>
                    {ORIGIN_LABELS[o]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="assignee_id">Responsável</label>
              <select
                className="input"
                id="assignee_id"
                name="assignee_id"
                defaultValue={affiliate?.assignee_id ?? ""}
              >
                <option value="">— sem responsável</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="state">Estado</label>
              <input
                className="input"
                id="state"
                name="state"
                placeholder="SP"
                defaultValue={affiliate?.state ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <input
                className="input"
                id="city"
                name="city"
                defaultValue={affiliate?.city ?? ""}
              />
            </div>

            <div className="field">
              <label htmlFor="first_contact_at">Primeiro contato</label>
              <input
                className="input"
                id="first_contact_at"
                name="first_contact_at"
                type="date"
                defaultValue={affiliate?.first_contact_at ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="last_contact_at">Último contato</label>
              <input
                className="input"
                id="last_contact_at"
                name="last_contact_at"
                type="date"
                defaultValue={affiliate?.last_contact_at ?? ""}
              />
            </div>

            <div className="field">
              <label htmlFor="follow_up_at">Follow-up</label>
              <input
                className="input"
                id="follow_up_at"
                name="follow_up_at"
                type="date"
                defaultValue={affiliate?.follow_up_at ?? ""}
              />
            </div>
            <div className="field">
              <label htmlFor="status">
                Status <span style={{ color: "var(--color-accent)" }}>*</span>
              </label>
              <select className="input" id="status" name="status" defaultValue={affiliate?.status ?? "novo"}>
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="niche">Nicho</label>
              <select className="input" id="niche" name="niche" defaultValue={affiliate?.niche ?? ""}>
                <option value="">Selecione</option>
                {NICHE_ORDER.map((n) => (
                  <option key={n} value={n}>
                    {NICHE_LABELS[n]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="engagement">Nível de engajamento</label>
              <select
                className="input"
                id="engagement"
                name="engagement"
                defaultValue={affiliate?.engagement ?? ""}
              >
                <option value="">Selecione</option>
                {ENGAGEMENT_ORDER.map((e) => (
                  <option key={e} value={e}>
                    {ENGAGEMENT_LABELS[e]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label style={{ marginBottom: 4 }}>Perfis nas redes</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {SOCIAL_PLATFORM_ORDER.map((p) => {
                const hasValue = !!(affiliate?.socials?.[p]);
                return (
                  <div
                    key={p}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      border: `1.5px solid ${hasValue ? "var(--color-accent)" : "var(--color-neutral-200)"}`,
                      borderRadius: "var(--r-card)",
                      padding: "10px 12px",
                      background: hasValue ? "var(--color-accent-100)" : "transparent",
                      transition: "border-color 150ms, background 150ms",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "var(--color-neutral-100)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: "none",
                        color: "var(--color-text)",
                      }}
                    >
                      {p === "instagram" && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
                          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                        </svg>
                      )}
                      {p === "youtube" && (
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" fill="currentColor" />
                          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48" fill="white" />
                        </svg>
                      )}
                      {p === "tiktok" && (
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .53.04.78.1v-3.5a6.37 6.37 0 0 0-.78-.05A6.34 6.34 0 0 0 3.14 15.3 6.34 6.34 0 0 0 9.49 21.5a6.34 6.34 0 0 0 6.35-6.36V8.66A8.24 8.24 0 0 0 20.7 10.5V7.04a4.79 4.79 0 0 1-1.11-.35z" fill="currentColor" />
                        </svg>
                      )}
                      {p === "twitter" && (
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" />
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.55 }}>
                        {SOCIAL_PLATFORM_LABELS[p]}
                      </span>
                      <input
                        name={`social_${p}`}
                        type="url"
                        placeholder={SOCIAL_PLATFORM_PLACEHOLDERS[p]}
                        defaultValue={affiliate?.socials?.[p] ?? ""}
                        style={{
                          border: "none",
                          background: "transparent",
                          outline: "none",
                          fontSize: 13,
                          fontWeight: 600,
                          padding: 0,
                          width: "100%",
                          color: "var(--color-text)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="field">
            <label htmlFor="conversion_trigger">Gatilho de conversão</label>
            <input
              className="input"
              id="conversion_trigger"
              name="conversion_trigger"
              placeholder="Ex: desconto exclusivo, parceria..."
              defaultValue={affiliate?.conversion_trigger ?? ""}
            />
          </div>

          <div className="field">
            <label htmlFor="notes">Observações</label>
            <textarea
              className="input"
              id="notes"
              name="notes"
              rows={3}
              defaultValue={affiliate?.notes ?? ""}
            />
          </div>

          <div className="field">
            <label htmlFor="media_kit_url">Mídia Kit URL</label>
            <input
              className="input"
              id="media_kit_url"
              name="media_kit_url"
              placeholder="https://..."
              defaultValue={affiliate?.media_kit_url ?? ""}
            />
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
              {pending ? "Salvando..." : isEdit ? "Salvar" : "Criar criador"}
            </button>
            <button className="btn btn-secondary" type="button" onClick={close} disabled={pending}>
              Cancelar
            </button>
            {isEdit && (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={onDelete}
                disabled={pending}
                style={{ color: "var(--color-accent-700)" }}
              >
                Excluir
              </button>
            )}
          </div>
        </form>
      </dialog>
    );
  }
);
