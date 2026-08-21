import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "./_components/page-header";
import { createClient } from "@/lib/supabase/server";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type TicketCategory,
} from "@/lib/tickets";

type Range = "week" | "month" | "all";

const RANGE_LABEL: Record<Range, string> = {
  week: "Semana",
  month: "Mês",
  all: "Total",
};

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
  const rangeStartDate = rangeStart(range);

  const openStatuses = ["solicitado", "em_andamento", "aguardando_cliente"];

  const [openRes, resolvedTodayRes, categoryRes, volumeRes] = await Promise.all([
    supabase.from("tickets").select("id", { count: "exact", head: true }).in("status", openStatuses),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("status", "resolvido")
      .gte("updated_at", today.toISOString()),
    (rangeStartDate
      ? supabase.from("tickets").select("category").gte("created_at", rangeStartDate.toISOString())
      : supabase.from("tickets").select("category")),
    supabase.from("tickets").select("created_at").gte("created_at", fourteenAgo.toISOString()),
  ]);

  const openCount = openRes.count ?? 0;
  const resolvedToday = resolvedTodayRes.count ?? 0;

  const categoryCounts: Record<TicketCategory, number> = {
    tarefa_sumiu: 0,
    erro_gravacao: 0,
    rejeicao_tarefa: 0,
    saque: 0,
    perfil_dados: 0,
    indicacao: 0,
    kyc: 0,
    outro: 0,
  };
  for (const row of (categoryRes.data ?? []) as { category: TicketCategory }[]) {
    if (row.category in categoryCounts) categoryCounts[row.category]++;
  }
  const maxCategory = Math.max(1, ...Object.values(categoryCounts));

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

  return (
    <>
      <PageHeader title="Dashboard" />

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <KpiRow openCount={openCount} resolvedToday={resolvedToday} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-6)", alignItems: "stretch" }}>
          <CategoriesCard counts={categoryCounts} max={maxCategory} range={range} />
          <VolumeCard days={volumeByDay} max={maxVolume} />
        </div>
      </div>
    </>
  );
}

function KpiRow({ openCount, resolvedToday }: { openCount: number; resolvedToday: number }) {
  return (
    <div
      className="soft"
      style={{
        background: "#ffffff",
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
    tone === "accent" ? "var(--color-accent-100)" : tone === "green" ? "#e6f6ee" : "var(--color-neutral-100)";
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
          color: tone === "green" ? "#166a45" : tone === "accent" ? "var(--color-accent-700)" : "var(--color-neutral-700)",
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

function CategoriesCard({
  counts,
  max,
  range,
}: {
  counts: Record<TicketCategory, number>;
  max: number;
  range: Range;
}) {
  return (
    <div
      className="soft"
      style={{
        background: "#ffffff",
        borderRadius: "var(--r-card)",
        padding: "var(--space-6)",
        minWidth: 0,
        flex: "1 1 460px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "var(--space-4)",
          flexWrap: "wrap",
          marginBottom: "var(--space-6)",
        }}
      >
        <div>
          <h4 style={{ margin: "0 0 2px" }}>Ocorrências por categoria</h4>
          <div style={{ fontSize: 12, opacity: 0.5 }}>{RANGE_LABEL[range]}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {(["week", "month", "all"] as Range[]).map((r) => {
            const active = r === range;
            return (
              <Link
                key={r}
                href={r === "week" ? "/" : `/?catRange=${r}`}
                className="btn"
                style={{
                  fontSize: 12,
                  padding: "6px 12px",
                  background: active ? "var(--color-accent)" : "var(--color-neutral-100)",
                  color: active ? "#ffffff" : "var(--color-text)",
                  borderRadius: "var(--r-sm)",
                }}
              >
                {RANGE_LABEL[r]}
              </Link>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200 }}>
        {CATEGORY_ORDER.map((cat) => {
          const count = counts[cat];
          const height = (count / max) * 180;
          return (
            <div
              key={cat}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                flex: 1,
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: CATEGORY_COLORS[cat] }}>{count || ""}</div>
              <div
                style={{
                  width: "100%",
                  height: Math.max(4, height),
                  borderRadius: "var(--r-sm)",
                  background: CATEGORY_COLORS[cat],
                  opacity: count === 0 ? 0.15 : 1,
                }}
              />
              <span
                style={{
                  fontSize: 10,
                  opacity: 0.6,
                  textAlign: "center",
                  lineHeight: 1.1,
                  minHeight: 22,
                }}
              >
                {CATEGORY_LABELS[cat]}
              </span>
            </div>
          );
        })}
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
        background: "#ffffff",
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
