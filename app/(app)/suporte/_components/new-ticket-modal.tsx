"use client";

import { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from "react";
import { useRouter } from "next/navigation";
import {
  addTicketAttachment,
  createTicket,
  deleteTicket,
  removeTicketAttachment,
  updateTicket,
} from "@/lib/actions/tickets";
import { SendToInventToggle } from "./send-to-invent-toggle";
import { createClient } from "@/lib/supabase/client";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  imageUrlsInText,
  isTicketImageMime,
  MAX_TICKET_IMAGE_BYTES,
  MAX_TICKET_IMAGES,
  mimeFromFilename,
  safeImageFilename,
  STATUS_LABELS,
  STATUS_ORDER,
  TICKET_ATTACHMENTS_BUCKET,
  type Profile,
  type Ticket,
  type TicketAttachment,
} from "@/lib/tickets";

function localInputValue(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function resolveMime(file: File) {
  if (isTicketImageMime(file.type)) return file.type;
  return mimeFromFilename(file.name);
}

export type TicketModalHandle = {
  openCreate: () => void;
  openEdit: (ticket: Ticket) => void;
};

export const TicketModal = forwardRef<TicketModalHandle, { profiles: Profile[]; canEdit: boolean }>(
  function TicketModal({ profiles, canEdit }, ref) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [openKey, setOpenKey] = useState(0);
    const router = useRouter();

    useImperativeHandle(ref, () => ({
      openCreate() {
        setTicket(null);
        setFiles([]);
        setOpenKey((key) => key + 1);
        dialogRef.current?.showModal();
      },
      openEdit(next) {
        setTicket(next);
        setFiles([]);
        setOpenKey((key) => key + 1);
        dialogRef.current?.showModal();
      },
    }));

    function close() {
      dialogRef.current?.close();
    }

    return (
      <>
        <dialog
          ref={dialogRef}
          className="soft"
          style={{
            border: "none",
            borderRadius: "var(--r-card)",
            padding: "var(--space-6)",
            background: "var(--color-card)",
            color: "var(--color-text)",
            maxWidth: 540,
            width: "calc(100vw - 32px)",
            maxHeight: "calc(100vh - 32px)",
            margin: "auto",
            overflow: "auto",
          }}
        >
          <TicketForm
            key={openKey}
            ticket={ticket}
            profiles={profiles}
            canEdit={canEdit}
            files={files}
            setFiles={setFiles}
            onClose={close}
            onSaved={() => {
              close();
              router.refresh();
            }}
          />
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
);

function TicketForm({
  ticket,
  profiles,
  canEdit,
  files,
  setFiles,
  onClose,
  onSaved,
}: {
  ticket: Ticket | null;
  profiles: Profile[];
  canEdit: boolean;
  files: File[];
  setFiles: (files: File[]) => void;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [savedId, setSavedId] = useState(ticket?.id ?? "");
  const isEdit = Boolean(ticket || savedId);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<TicketAttachment[]>(ticket?.attachments ?? []);
  const [description, setDescription] = useState(ticket?.description ?? "");
  const [notes, setNotes] = useState(ticket?.extra_data?.notes ?? "");
  const router = useRouter();

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [files]
  );
  useEffect(() => {
    return () => {
      for (const preview of previews) URL.revokeObjectURL(preview.url);
    };
  }, [previews]);

  const linked = useMemo(() => imageUrlsInText(`${description}\n${notes}`), [description, notes]);
  const signed = useSignedUrls(attachments.map((item) => item.storage_path));
  const slotsLeft = MAX_TICKET_IMAGES - attachments.length - files.length;

  function onPickFiles(list: FileList | null) {
    if (!list) return;
    const picked = [...list];
    const room = MAX_TICKET_IMAGES - attachments.length - files.length;
    if (room <= 0) {
      setError("Um ticket pode ter no máximo 4 imagens.");
      return;
    }
    const accepted: File[] = [];
    for (const file of picked.slice(0, room)) {
      if (!resolveMime(file)) {
        setError("Use PNG, JPG, GIF ou WebP.");
        return;
      }
      if (file.size > MAX_TICKET_IMAGE_BYTES) {
        setError("Cada imagem pode ter no máximo 5 MB.");
        return;
      }
      accepted.push(file);
    }
    setError(null);
    setFiles([...files, ...accepted]);
  }

  async function uploadOne(ticketId: string, file: File) {
    const mime = resolveMime(file);
    if (!mime) throw new Error("Use PNG, JPG, GIF ou WebP.");
    const supabase = createClient();
    const path = `${ticketId}/${crypto.randomUUID()}-${safeImageFilename(file.name)}`;
    const { error: uploadError } = await supabase.storage.from(TICKET_ATTACHMENTS_BUCKET).upload(path, file, {
      contentType: mime,
      upsert: false,
    });
    if (uploadError) throw new Error(uploadError.message);
    try {
      return await addTicketAttachment({
        ticketId,
        storagePath: path,
        filename: file.name,
        mime,
        size: file.size,
      });
    } catch (err) {
      await supabase.storage.from(TICKET_ATTACHMENTS_BUCKET).remove([path]);
      throw err;
    }
  }

  async function onSubmit(formData: FormData) {
    if (!canEdit) return;
    setError(null);
    setPending(true);
    let id = savedId;
    try {
      if (id) {
        await updateTicket(id, formData);
      } else {
        id = await createTicket(formData);
        setSavedId(id);
      }
      const saved: TicketAttachment[] = [];
      for (const file of files) {
        try {
          saved.push(await uploadOne(id, file));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Erro ao enviar imagem";
          setAttachments((current) => [...current, ...saved]);
          setFiles(files.slice(saved.length));
          setError(`Ticket salvo, mas a imagem falhou: ${message}`);
          router.refresh();
          return;
        }
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar ticket");
    } finally {
      setPending(false);
    }
  }

  async function onDelete() {
    const id = ticket?.id || savedId;
    if (!id) return;
    if (!confirm("Excluir este ticket? Essa ação não pode ser desfeita.")) return;
    setError(null);
    setPending(true);
    try {
      await deleteTicket(id);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir ticket");
    } finally {
      setPending(false);
    }
  }

  async function onRemoveAttachment(id: string) {
    const previous = attachments;
    setAttachments(attachments.filter((item) => item.id !== id));
    try {
      await removeTicketAttachment(id);
      router.refresh();
    } catch (err) {
      setAttachments(previous);
      setError(err instanceof Error ? err.message : "Erro ao remover imagem");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h4 style={{ margin: 0 }}>{isEdit ? (canEdit ? "Editar ticket" : "Ticket") : "Novo ticket"}</h4>
        <button
          type="button"
          onClick={onClose}
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

      <form action={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
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
            disabled={!canEdit}
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
            disabled={!canEdit}
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
              disabled={!canEdit}
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
              disabled={!canEdit}
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
            disabled={!canEdit}
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
            disabled={!canEdit}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            disabled={!canEdit}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="ticket-images">Imagens</label>
          {(attachments.length > 0 || previews.length > 0 || linked.length > 0) && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
              {attachments.map((item) => (
                <figure key={item.id} style={{ margin: 0, width: 96 }}>
                  {signed[item.storage_path] ? (
                    <a href={signed[item.storage_path]} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={signed[item.storage_path]}
                        alt={item.filename}
                        style={{ width: 96, height: 96, objectFit: "cover", borderRadius: "var(--r-sm)" }}
                      />
                    </a>
                  ) : (
                    <div
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: "var(--r-sm)",
                        background: "var(--color-neutral-100)",
                      }}
                    />
                  )}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => onRemoveAttachment(item.id)}
                      style={{
                        marginTop: 4,
                        border: "none",
                        background: "transparent",
                        color: "var(--color-accent-700)",
                        fontSize: 11,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Remover
                    </button>
                  )}
                </figure>
              ))}
              {files.map((file, index) => (
                <figure key={`${file.name}-${file.size}-${index}`} style={{ margin: 0, width: 96 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previews[index]?.url}
                    alt={file.name}
                    style={{ width: 96, height: 96, objectFit: "cover", borderRadius: "var(--r-sm)" }}
                  />
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setFiles(files.filter((_, i) => i !== index))}
                      style={{
                        marginTop: 4,
                        border: "none",
                        background: "transparent",
                        color: "var(--color-accent-700)",
                        fontSize: 11,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Tirar
                    </button>
                  )}
                </figure>
              ))}
              {linked.map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="Imagem citada no ticket"
                    style={{ width: 96, height: 96, objectFit: "cover", borderRadius: "var(--r-sm)" }}
                  />
                </a>
              ))}
            </div>
          )}
          {canEdit && (
            <>
              <input
                className="input"
                id="ticket-images"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                disabled={pending || slotsLeft <= 0}
                onChange={(e) => {
                  onPickFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <div style={{ fontSize: 11, opacity: 0.55, marginTop: 4 }}>
                PNG, JPG, GIF ou WebP. Até 4 imagens, 5 MB cada.
              </div>
            </>
          )}
        </div>

        <SendToInventToggle ticketId={ticket?.id || savedId || undefined} value={ticket?.send_to_invent ?? false} canEdit={canEdit} />

        <div className="field">
          <label htmlFor="status">Status</label>
          <select className="input" id="status" name="status" disabled={!canEdit} defaultValue={ticket?.status ?? "solicitado"}>
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

        <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-2)", alignItems: "center" }}>
          {canEdit ? (
            <button className="btn btn-primary" type="submit" disabled={pending} style={{ flex: 1, justifyContent: "center" }}>
              {pending ? "Salvando..." : isEdit ? "Salvar" : "Criar ticket"}
            </button>
          ) : null}
          <button className="btn btn-secondary" type="button" onClick={onClose} disabled={pending}>
            {canEdit ? "Cancelar" : "Fechar"}
          </button>
          {canEdit && isEdit && (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              aria-label="Excluir ticket"
              title="Excluir ticket"
              style={{
                border: "none",
                background: "transparent",
                cursor: pending ? "wait" : "pointer",
                color: "var(--color-accent-700)",
                padding: 8,
                display: "inline-flex",
                marginLeft: "auto",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function useSignedUrls(paths: string[]) {
  const key = paths.join("|");
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!key) return;
    let cancel = false;
    const list = key.split("|");
    const supabase = createClient();
    void supabase.storage
      .from(TICKET_ATTACHMENTS_BUCKET)
      .createSignedUrls(list, 60 * 60)
      .then(({ data }) => {
        if (cancel || !data) return;
        const next: Record<string, string> = {};
        for (const item of data) {
          if (item.path && item.signedUrl) next[item.path] = item.signedUrl;
        }
        setUrls(next);
      });
    return () => {
      cancel = true;
    };
  }, [key]);

  return urls;
}
