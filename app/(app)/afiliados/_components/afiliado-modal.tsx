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
  SOCIAL_LABELS,
  SOCIAL_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
  type Affiliate,
  type Social,
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
      if (!confirm("Excluir este afiliado? Essa ação não pode ser desfeita.")) return;
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
    const socialSet = new Set<Social>(affiliate?.socials ?? []);

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
              <h4 style={{ margin: "0 0 4px" }}>{isEdit ? "Editar afiliado" : "Novo afiliado"}</h4>
              <div style={{ fontSize: 13, opacity: 0.6 }}>
                {isEdit ? "Atualize os dados do afiliado." : "Preencha os dados iniciais do afiliado."}
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
            <div className="field">
              <label htmlFor="name">
                Nome <span style={{ color: "var(--color-accent)" }}>*</span>
              </label>
              <input className="input" id="name" name="name" required defaultValue={affiliate?.name ?? ""} />
            </div>
            <div className="field">
              <label htmlFor="handle">Handle</label>
              <input
                className="input"
                id="handle"
                name="handle"
                placeholder="@username"
                defaultValue={affiliate?.handle ?? ""}
              />
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
            <label>Redes sociais do criador</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SOCIAL_ORDER.map((s) => (
                <label
                  key={s}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    border: "1px solid var(--color-neutral-200)",
                    borderRadius: "var(--r-sm)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    name="socials"
                    value={s}
                    defaultChecked={socialSet.has(s)}
                    style={{ margin: 0 }}
                  />
                  {SOCIAL_LABELS[s]}
                </label>
              ))}
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
              {pending ? "Salvando..." : isEdit ? "Salvar" : "Criar afiliado"}
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
