export type ProfileRole = "admin" | "gerente" | "moderator" | "member";

export const ROLE_LABELS: Record<ProfileRole, string> = {
  admin: "Admin",
  gerente: "Gerente",
  moderator: "Moderador",
  member: "Membro",
};

export const ROLE_DESCRIPTION: Record<ProfileRole, string> = {
  admin: "Pode tudo, incluindo gerenciar usuários",
  gerente: "Gerencia criadores e kanban",
  moderator: "Gerencia tickets de suporte",
  member: "Somente visualiza",
};

export const ROLE_ORDER: ProfileRole[] = ["admin", "gerente", "moderator", "member"];
