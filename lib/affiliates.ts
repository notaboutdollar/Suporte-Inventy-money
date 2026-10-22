export type AffiliateStatus =
  | "novo"
  | "no_processo"
  | "em_negociacao"
  | "ativo"
  | "fechado"
  | "sem_resposta"
  | "recusado";

export type AffiliateOrigin =
  | "twitter"
  | "instagram"
  | "tiktok"
  | "linkedin"
  | "youtube"
  | "indicacao"
  | "organico"
  | "outro";

export type AffiliateNiche =
  | "web3"
  | "lifestyle"
  | "financas"
  | "dev"
  | "ia"
  | "gastronomia"
  | "modelo"
  | "comedia"
  | "viagens"
  | "geopolitica"
  | "produtos"
  | "outro";

export type AffiliateEngagement = "alto" | "medio" | "baixo";

export type SocialPlatform = "instagram" | "youtube" | "tiktok" | "twitter";
export type SocialLinks = Partial<Record<SocialPlatform, string>>;

export type Affiliate = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  state: string | null;
  city: string | null;
  origin: AffiliateOrigin | null;
  socials: SocialLinks;
  niche: AffiliateNiche | null;
  engagement: AffiliateEngagement | null;
  status: AffiliateStatus;
  first_contact_at: string | null;
  last_contact_at: string | null;
  follow_up_at: string | null;
  conversion_trigger: string | null;
  notes: string | null;
  media_kit_url: string | null;
  assignee_id: string | null;
  assignee?: { name: string } | null;
  created_at: string;
  updated_at: string;
};

export function normalizeSocials(raw: unknown): SocialLinks {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as SocialLinks;
}

export const STATUS_ORDER: AffiliateStatus[] = [
  "novo",
  "no_processo",
  "em_negociacao",
  "ativo",
  "fechado",
  "sem_resposta",
  "recusado",
];

export const STATUS_LABELS: Record<AffiliateStatus, string> = {
  novo: "Novo",
  no_processo: "No processo",
  em_negociacao: "Em negociação",
  ativo: "Ativo",
  fechado: "Fechado",
  sem_resposta: "Sem resposta",
  recusado: "Recusado",
};

export const STATUS_TAG_STYLE: Record<
  AffiliateStatus,
  { color: string; border: string; dot: string }
> = {
  novo: { color: "var(--aff-novo)", border: "var(--aff-novo-border)", dot: "var(--aff-novo)" },
  no_processo: { color: "var(--aff-processo)", border: "var(--aff-processo-border)", dot: "var(--aff-processo)" },
  em_negociacao: { color: "var(--aff-negociacao)", border: "var(--aff-negociacao-border)", dot: "var(--aff-negociacao)" },
  ativo: { color: "var(--aff-ativo)", border: "var(--aff-ativo-border)", dot: "var(--aff-ativo)" },
  fechado: { color: "var(--aff-fechado)", border: "var(--aff-fechado-border)", dot: "var(--aff-fechado)" },
  sem_resposta: { color: "var(--aff-sem)", border: "var(--aff-sem-border)", dot: "var(--aff-sem)" },
  recusado: { color: "var(--aff-recusado)", border: "var(--aff-recusado-border)", dot: "var(--aff-recusado)" },
};

export const ORIGIN_ORDER: AffiliateOrigin[] = [
  "twitter",
  "instagram",
  "tiktok",
  "linkedin",
  "youtube",
  "indicacao",
  "organico",
  "outro",
];

export const ORIGIN_LABELS: Record<AffiliateOrigin, string> = {
  twitter: "Twitter/X",
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  indicacao: "Indicação",
  organico: "Orgânico",
  outro: "Outro",
};

export const NICHE_ORDER: AffiliateNiche[] = [
  "web3",
  "lifestyle",
  "financas",
  "dev",
  "ia",
  "gastronomia",
  "modelo",
  "comedia",
  "viagens",
  "geopolitica",
  "produtos",
  "outro",
];

export const NICHE_LABELS: Record<AffiliateNiche, string> = {
  web3: "Web 3",
  lifestyle: "Lifestyle",
  financas: "Finanças",
  dev: "Dev",
  ia: "IA",
  gastronomia: "Gastronomia",
  modelo: "Modelo",
  comedia: "Comédia",
  viagens: "Viagens",
  geopolitica: "GeoPolítica",
  produtos: "Produtos",
  outro: "Outro",
};

export const NICHE_COLORS: Record<AffiliateNiche, string> = {
  web3: "#8140c9",
  lifestyle: "#e08a1f",
  financas: "#0f7b46",
  dev: "#1e6fd9",
  ia: "#c73847",
  gastronomia: "#b06400",
  modelo: "#c73870",
  comedia: "#7b3ac7",
  viagens: "#1fa5c9",
  geopolitica: "#5b6b7b",
  produtos: "#a56cc7",
  outro: "#6b6b6b",
};

export const ENGAGEMENT_ORDER: AffiliateEngagement[] = ["alto", "medio", "baixo"];

export const ENGAGEMENT_LABELS: Record<AffiliateEngagement, string> = {
  alto: "Alto",
  medio: "Médio",
  baixo: "Baixo",
};

export const ENGAGEMENT_STYLE: Record<
  AffiliateEngagement,
  { color: string; bg: string }
> = {
  alto: { color: "var(--eng-alto)", bg: "var(--eng-alto-bg)" },
  medio: { color: "var(--eng-medio)", bg: "var(--eng-medio-bg)" },
  baixo: { color: "var(--eng-baixo)", bg: "var(--eng-baixo-bg)" },
};

export const SOCIAL_PLATFORM_ORDER: SocialPlatform[] = ["instagram", "youtube", "tiktok", "twitter"];

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  twitter: "X (Twitter)",
};

export const SOCIAL_PLATFORM_PLACEHOLDERS: Record<SocialPlatform, string> = {
  instagram: "https://instagram.com/usuario",
  youtube: "https://youtube.com/@canal",
  tiktok: "https://tiktok.com/@usuario",
  twitter: "https://x.com/usuario",
};
