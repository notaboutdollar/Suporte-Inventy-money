export type TicketCategory =
  | "top_up"
  | "bonus"
  | "cartao"
  | "cadastro"
  | "kyc"
  | "conta_restrita"
  | "outro";

export type TicketStatus =
  | "solicitado"
  | "em_andamento"
  | "aguardando_cliente"
  | "resolvido"
  | "fechado";

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  top_up: "Top-up",
  bonus: "Bônus",
  cartao: "Cartão",
  cadastro: "Cadastro",
  kyc: "KYC",
  conta_restrita: "Conta restrita",
  outro: "Outro",
};

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

export type Ticket = {
  id: string;
  telegram_handle: string | null;
  email: string | null;
  category: TicketCategory;
  description: string;
  status: TicketStatus;
  assignee: { name: string } | null;
  created_at: string;
};
