import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "./_components/page-header";
import { CategoryChart } from "./_components/category-chart";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_ORDER, type TicketCategory } from "@/lib/tickets";
import {
  NICHE_LABELS,
  ORIGIN_LABELS,
  STATUS_LABELS as AFF_STATUS_LABELS,
  STATUS_TAG_STYLE as AFF_STATUS_TAG_STYLE,
  normalizeSocials,
  type AffiliateNiche,
  type AffiliateOrigin,
  type AffiliateStatus,
  type SocialLinks,
} from "@/lib/affiliates";
import { SocialLinkIcons } from "./_components/social-links";

type Range = "week" | "month" | "all";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function rangeStart(r: Range) {
  if (r === "week") return daysAgo(7);
  if (r === "month") return daysAgo(30);
  return null;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ catRange?: string }>;
}) {
  const { catRange } = await searchParams;
  const range: Range = catRange === "month" ? "month" : catRange === "all" ? "all" : "week";

  const supabase = await createClient();
  const today = startOfDay(new Date());
  const fourteenAgo = daysAgo(13);
  const weekStart = rangeStart("week");
  const monthStart = rangeStart("month");

  const openStatuses = ["solicitado", "em_andamento", "aguardando_cliente"];
  const activeAffStatuses = ["novo", "no_processo", "em_negociacao", "ativo"];
  const closedAffStatuses = ["fechado"];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [openRes, resolvedTodayRes, categoryRes, volumeRes, totalAffRes, activeAffRes, closedAffRes, followUpsRes, recentAffRes] = await Promise.all([
    supabase.from("tickets").select("id", { count: "exact", head: true }).in("status", openStatuses),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "resolvido")
      .gte("updated_at", today.toISOString()),
    supabase.from("tickets").select("category, created_at"),
    supabase.from("tickets").select("created_at").gte("created_at", fourteenAgo.toISOString()),
    supabase.from("affiliates").select("id", { count: "exact", head: true }),
    supabase.from("affiliates").select("id", { count: "exact", head: true }).in("status", activeAffStatuses),
    supabase.from("affiliates").select("id", { count: "exact", head: true }).in("status", closedAffStatuses),
    supabase
      .from("affiliates")
      .select("id", { count: "exact", head: true })
      .gte("follow_up_at", today.toISOString().slice(0, 10))
      .lt("follow_up_at", tomorrow.toISOString().slice(0, 10)),
    supabase
      .from("affiliates")
      .select("id, name, socials, origin, status, niche, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const openCount = openRes.count ?? 0;
  const resolvedToday = resolvedTodayRes.count ?? 0;

  const categoryRows = (categoryRes.data ?? []) as { category: TicketCategory; created_at: string }[];
  function tally(since: Date | null) {
    const counts = Object.fromEntries(CATEGORY_ORDER.map((cat) => [cat, 0])) as Record<TicketCategory, number>;
    for (const row of categoryRows) {
      if (since && new Date(row.created_at) < since) continue;
      if (row.category in counts) counts[row.category]++;
    }
    return { counts, max: Math.max(1, ...Object.values(counts)) };
  }
  const categorySeries = {
    week: tally(weekStart),
    month: tally(monthStart),
    all: tally(null),
  };

  const volumeByDay: { label: string; count: number; iso: string }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenAgo);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    volumeByDay.push({
      iso,
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      count: 0,
    });
  }
  for (const row of (volumeRes.data ?? []) as { created_at: string }[]) {
    const iso = row.created_at.slice(0, 10);
    const bucket = volumeByDay.find((b) => b.iso === iso);
    if (bucket) bucket.count++;
  }
  const maxVolume = Math.max(1, ...volumeByDay.map((b) => b.count));

  const totalAff = totalAffRes.count ?? 0;
  const activeAff = activeAffRes.count ?? 0;
  const closedAff = closedAffRes.count ?? 0;
  const followUpsToday = followUpsRes.count ?? 0;

  type RecentAffRaw = {
    id: string;
    name: string;
    socials: unknown;
    origin: AffiliateOrigin | null;
    status: AffiliateStatus;
    niche: AffiliateNiche | null;
    created_at: string;
  };
  const recentAffiliates = ((recentAffRes.data ?? []) as RecentAffRaw[]).map((r) => ({
    ...r,
    socials: normalizeSocials(r.socials),
  }));

  return (
    <>
      <PageHeader title="Dashboard" />

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <SectionHeader title="Suporte" href="/suporte" hrefLabel="Ver tickets" />
          <KpiRow openCount={openCount} resolvedToday={resolvedToday} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-6)", alignItems: "stretch" }}>
            <CategoryChart initial={range} series={categorySeries} />
            <VolumeCard days={volumeByDay} max={maxVolume} />
          </div>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <SectionHeader title="Criadores" href="/afiliados" hrefLabel="Ver todos" />
          <AffKpiRow total={totalAff} active={activeAff} closed={closedAff} followUps={followUpsToday} />
          <RecentAffiliatesCard rows={recentAffiliates} />
        </section>
      </div>
    </>
  );
}

function SectionHeader({ title, href, hrefLabel }: { title: string; href: string; hrefLabel: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <h3 style={{ margin: 0 }}>{title}</h3>
      <Link
        href={href}
        prefetch={true}
        style={{ fontSize: 13, color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}
      >
        {hrefLabel} →
      </Link>
    </div>
  );
}

function AffKpiRow({
  total,
  active,
  closed,
  followUps,
}: {
  total: number;
  active: number;
  closed: number;
  followUps: number;
}) {
  return (
    <div
      className="soft"
      style={{
        background: "var(--color-card)",
        borderRadius: "var(--r-card)",
        padding: "var(--space-6)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "var(--space-6)",
      }}
    >
      <Kpi label="Total criadores" value={total.toString()} icon={<IconUsers />} tone="neutral" />
      <Kpi label="Ativos" value={active.toString()} icon={<IconSparkle />} tone="accent" />
      <Kpi label="Fechados" value={closed.toString()} icon={<IconCheck />} tone="green" />
      <Kpi label="Follow-ups hoje" value={followUps.toString()} icon={<IconClock />} tone="accent" />
    </div>
  );
}

function RecentAffiliatesCard({
  rows,
}: {
  rows: {
    id: string;
    name: string;
    socials: SocialLinks;
    origin: AffiliateOrigin | null;
    status: AffiliateStatus;
    niche: AffiliateNiche | null;
    created_at: string;
  }[];
}) {
  return (
    <div
      className="soft"
      style={{ background: "var(--color-card)", borderRadius: "var(--r-card)", padding: "var(--space-6)", overflowX: "auto" }}
    >
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 4px" }}>Criadores recentes</h4>
        <div style={{ fontSize: 12, opacity: 0.55 }}>Últimos {rows.length} cadastros</div>
      </div>
      {rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: "var(--space-6)", opacity: 0.55 }}>
          Nenhum criador cadastrado ainda.
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Redes</th>
              <th>Origem</th>
              <th>Nicho</th>
              <th>Status</th>
              <th>Adicionado em</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const tag = AFF_STATUS_TAG_STYLE[r.status];
              return (
                <tr key={r.id}>
                  <td><strong>{r.name}</strong></td>
                  <td><SocialLinkIcons links={r.socials} size={15} /></td>
                  <td style={{ fontSize: 12 }}>{r.origin ? ORIGIN_LABELS[r.origin] : "—"}</td>
                  <td style={{ fontSize: 12 }}>{r.niche ? NICHE_LABELS[r.niche] : "—"}</td>
                  <td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: tag.color,
                        border: `1px solid ${tag.border}`,
                        borderRadius: "var(--r-sm)",
                        padding: "3px 10px",
                      }}
                    >
                      {AFF_STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, opacity: 0.75, whiteSpace: "nowrap" }}>
                    {new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(new Date(r.created_at))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function KpiRow({ openCount, resolvedToday }: { openCount: number; resolvedToday: number }) {
  return (
    <div
      className="soft"
      style={{
        background: "var(--color-card)",
        borderRadius: "var(--r-card)",
        padding: "var(--space-6)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "var(--space-6)",
      }}
    >
      <Kpi label="Tickets abertos" value={openCount.toString()} icon={<IconTicket />} tone="accent" />
      <Kpi label="Resolvidos hoje" value={resolvedToday.toString()} icon={<IconCheck />} tone="green" />
      <Kpi label="Média first response" value="—" icon={<IconClock />} tone="neutral" hint="em breve" />
      <Kpi label="Média resolução" value="—" icon={<IconTimer />} tone="neutral" hint="em breve" />
      <Kpi label="SLA no prazo" value="—" icon={<IconTarget />} tone="neutral" hint="em breve" />
    </div>
  );
}

function Kpi({
  label,
  value,
  icon,
  tone,
  hint,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone: "accent" | "green" | "neutral";
  hint?: string;
}) {
  const bg =
    tone === "accent" ? "var(--color-accent-100)" : tone === "green" ? "var(--color-ok-bg)" : "var(--color-neutral-100)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", minWidth: 0 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "var(--r-md)",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
          color: tone === "green" ? "var(--color-ok)" : tone === "accent" ? "var(--color-accent-700)" : "var(--color-neutral-700)",
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 2 }}>{label}</div>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 26, lineHeight: 1.05 }}>{value}</div>
        {hint && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>{hint}</div>}
      </div>
    </div>
  );
}

function VolumeCard({ days, max }: { days: { label: string; count: number }[]; max: number }) {
  const width = 100;
  const height = 60;
  const step = width / (days.length - 1);
  const points = days
    .map((d, i) => `${(i * step).toFixed(2)},${(height - (d.count / max) * height).toFixed(2)}`)
    .join(" ");

  return (
    <div
      className="soft"
      style={{
        background: "var(--color-card)",
        borderRadius: "var(--r-card)",
        padding: "var(--space-6)",
        minWidth: 0,
        flex: "1 1 380px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h4 style={{ margin: "0 0 2px" }}>Volume de tickets</h4>
        <div style={{ fontSize: 12, opacity: 0.5 }}>Últimos 14 dias</div>
      </div>

      <div style={{ flex: 1, minHeight: 200, display: "flex", flexDirection: "column" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ width: "100%", height: 180, overflow: "visible" }}
        >
          <polyline
            points={points}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {days.map((d, i) => (
            <circle
              key={i}
              cx={i * step}
              cy={height - (d.count / max) * height}
              r="1.2"
              fill="var(--color-accent)"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.5, marginTop: 8 }}>
          {days.map((d, i) => (
            <span key={i} style={{ flex: 1, textAlign: "center" }}>
              {i % 2 === 0 ? d.label : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* icons */

function IconTicket() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V9z" />
      <path d="M13 5v2M13 17v2M13 11v2" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}
function IconTimer() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="14" r="8" />
      <path d="M12 10v4l2 2" />
      <path d="M9 2h6M12 6V2" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconSparkle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z" />
    </svg>
  );
}
