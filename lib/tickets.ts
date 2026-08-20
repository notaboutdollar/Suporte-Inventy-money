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
  created_at: string;
};

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
