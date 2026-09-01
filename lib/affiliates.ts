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

export type Social = "twitter" | "instagram" | "tiktok" | "youtube" | "linkedin" | "outro";

export type Affiliate = {
  id: string;
  name: string;
  handle: string | null;
  phone: string | null;
  email: string | null;
  state: string | null;
  city: string | null;
  origin: AffiliateOrigin | null;
  socials: Social[];
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
  novo: { color: "#1e6fd9", border: "#a9caf5", dot: "#1e6fd9" },
  no_processo: { color: "#b06400", border: "#f5c98a", dot: "#e08a1f" },
  em_negociacao: { color: "#8140c9", border: "#d9c1f5", dot: "#8140c9" },
  ativo: { color: "#0f7b46", border: "#a5e0c0", dot: "#0f7b46" },
  fechado: { color: "#166a45", border: "#89dcb6", dot: "#166a45" },
  sem_resposta: { color: "#6b6b6b", border: "#cccccc", dot: "#8a8a8a" },
  recusado: { color: "#b02a37", border: "#f2b5bb", dot: "#c73847" },
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
  alto: { color: "#0f7b46", bg: "#dff5e8" },
  medio: { color: "#b06400", bg: "#fceedd" },
  baixo: { color: "#6b6b6b", bg: "#eaeaea" },
};

export const SOCIAL_LABELS: Record<Social, string> = {
  twitter: "Twitter/X",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  outro: "Outro",
};

export const SOCIAL_ORDER: Social[] = ["twitter", "instagram", "tiktok", "youtube", "linkedin", "outro"];
