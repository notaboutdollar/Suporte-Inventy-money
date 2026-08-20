export type ProfileRole = "admin" | "moderator" | "member";

export const ROLE_LABELS: Record<ProfileRole, string> = {
  admin: "Admin",
  moderator: "Moderador",
  member: "Membro",
};

export const ROLE_DESCRIPTION: Record<ProfileRole, string> = {
  admin: "Pode tudo, incluindo gerenciar usuários",
  moderator: "Cria, atualiza e atribui tickets",
  member: "Somente visualiza tickets",
};

export const ROLE_ORDER: ProfileRole[] = ["admin", "moderator", "member"];
