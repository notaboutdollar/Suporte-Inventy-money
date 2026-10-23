export type TicketCategory =
  | "tarefa_sumiu"
  | "erro_gravacao"
  | "rejeicao_tarefa"
  | "saque"
  | "perfil_dados"
  | "indicacao"
  | "kyc"
  | "outro";

export type TicketStatus =
  | "solicitado"
  | "em_andamento"
  | "aguardando_cliente"
  | "resolvido"
  | "fechado";

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  tarefa_sumiu: "Tarefa sumiu",
  erro_gravacao: "Erro na gravação",
  rejeicao_tarefa: "Rejeição de tarefa",
  saque: "Saque",
  perfil_dados: "Perfil de dados",
  indicacao: "Indicação",
  kyc: "KYC",
  outro: "Outro",
};

export const CATEGORY_COLORS: Record<TicketCategory, string> = {
  tarefa_sumiu: "#ec3013",
  erro_gravacao: "#e88b1a",
  rejeicao_tarefa: "#8b5cf6",
  saque: "#22a06b",
  perfil_dados: "#3b82f6",
  indicacao: "#0ea5e9",
  kyc: "#eab308",
  outro: "#9b9797",
};

export const CATEGORY_ORDER: TicketCategory[] = [
  "tarefa_sumiu",
  "erro_gravacao",
  "rejeicao_tarefa",
  "saque",
  "perfil_dados",
  "indicacao",
  "kyc",
  "outro",
];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  solicitado: "Solicitado",
  em_andamento: "Em andamento",
  aguardando_cliente: "Aguardando cliente",
  resolvido: "Resolvido",
  fechado: "Fechado",
};

export const STATUS_ORDER: TicketStatus[] = [
  "solicitado",
  "em_andamento",
  "aguardando_cliente",
  "resolvido",
  "fechado",
];

export type Profile = {
  id: string;
  name: string;
};

export type TicketAttachment = {
  id: string;
  storage_path: string;
  filename: string;
  mime: string | null;
  size: number | null;
};

export type Ticket = {
  id: string;
  whatsapp: string | null;
  email: string | null;
  category: TicketCategory;
  description: string;
  status: TicketStatus;
  assignee_id: string | null;
  assignee: { name: string } | null;
  extra_data: { notes?: string } | null;
  attachments: TicketAttachment[];
  send_to_invent: boolean;
  created_at: string;
};

export const TICKET_LIST_SELECT =
  "id, whatsapp, email, category, description, status, assignee_id, extra_data, send_to_invent, created_at, assignee:profiles(name), attachments:ticket_attachments(id, storage_path, filename, mime, size)";

export function toTicket(row: Record<string, unknown>): Ticket {
  const assigneeRaw = row.assignee as { name?: string } | { name?: string }[] | null;
  const assignee = Array.isArray(assigneeRaw) ? (assigneeRaw[0] ?? null) : assigneeRaw;
  const attachmentsRaw = (row.attachments as TicketAttachment[] | null) ?? [];
  return {
    id: row.id as string,
    whatsapp: (row.whatsapp as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    category: row.category as TicketCategory,
    description: (row.description as string) ?? "",
    status: row.status as TicketStatus,
    assignee_id: (row.assignee_id as string | null) ?? null,
    assignee: assignee?.name ? { name: assignee.name } : null,
    extra_data: (row.extra_data as Ticket["extra_data"]) ?? null,
    attachments: attachmentsRaw,
    send_to_invent: row.send_to_invent === true,
    created_at: row.created_at as string,
  };
}

export const TICKET_IMAGE_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
export const MAX_TICKET_IMAGES = 4;
export const MAX_TICKET_IMAGE_BYTES = 5 * 1024 * 1024;
export const TICKET_ATTACHMENTS_BUCKET = "ticket-attachments";

export function isTicketImageMime(mime: string) {
  return (TICKET_IMAGE_MIMES as readonly string[]).includes(mime);
}

export function safeImageFilename(name: string) {
  const base = name.split(/[/\\]/).pop() || "imagem";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return cleaned || "imagem";
}

export function mimeFromFilename(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "gif") return "image/gif";
  if (ext === "webp") return "image/webp";
  return null;
}

const IMAGE_URL = /https?:\/\/[^\s<>"')]+?\.(?:png|jpe?g|gif|webp)(?:\?[^\s<>"')]+)?/gi;

export function imageUrlsInText(text: string | null | undefined) {
  if (!text) return [];
  return [...new Set(text.match(IMAGE_URL) ?? [])];
}

export const STATUS_TAG_STYLE: Record<TicketStatus, { border: string; color: string; bg: string }> = {
  solicitado: {
    border: "var(--color-neutral-400)",
    color: "var(--color-neutral-700)",
    bg: "var(--color-neutral-100)",
  },
  em_andamento: {
    border: "#e88b1a",
    color: "#a86200",
    bg: "#fff4e5",
  },
  aguardando_cliente: {
    border: "var(--color-neutral-500)",
    color: "var(--color-neutral-800)",
    bg: "var(--color-neutral-100)",
  },
  resolvido: {
    border: "#22a06b",
    color: "#166a45",
    bg: "#e6f6ee",
  },
  fechado: {
    border: "var(--color-neutral-300)",
    color: "var(--color-neutral-600)",
    bg: "var(--color-neutral-100)",
  },
};
