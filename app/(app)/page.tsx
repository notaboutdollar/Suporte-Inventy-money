import type { ReactNode } from "react";
import { PageHeader } from "./_components/page-header";

const MONTHS: { label: string; height: number; highlight?: boolean; tooltip?: string }[] = [
  { label: "Jan", height: 98 },
  { label: "Fev", height: 126 },
  { label: "Mar", height: 156 },
  { label: "Abr", height: 116 },
  { label: "Mai", height: 84 },
  { label: "Jun", height: 116 },
  { label: "Jul", height: 184, highlight: true, tooltip: "R$ 89,4 mil" },
  { label: "Ago", height: 160 },
  { label: "Set", height: 134 },
  { label: "Out", height: 98 },
  { label: "Nov", height: 148 },
  { label: "Dez", height: 172 },
];

const PLANS = [
  { name: "Business", pct: 62, color: "var(--color-accent)" },
  { name: "Starter", pct: 22, color: "var(--color-accent-300)" },
  { name: "Trial", pct: 16, color: "var(--color-neutral-200)" },
];

type TxStatus = "Pago" | "Pendente" | "Cancelado";
const TRANSACTIONS: { client: string; product: string; date: string; amount: string; status: TxStatus }[] = [
  { client: "Fernanda Alves", product: "Plano Business", date: "12/08/2026", amount: "R$ 1.240,00", status: "Pago" },
  { client: "Marcos Teixeira", product: "Consultoria", date: "11/08/2026", amount: "R$ 680,00", status: "Pendente" },
  { client: "Julia Prado", product: "Plano Starter", date: "10/08/2026", amount: "R$ 249,00", status: "Pago" },
  { client: "Roberto Lima", product: "Upgrade de Plano", date: "09/08/2026", amount: "R$ 3.100,00", status: "Pago" },
  { client: "Camila Nunes", product: "Plano Business", date: "08/08/2026", amount: "R$ 1.240,00", status: "Cancelado" },
  { client: "Diego Souza", product: "Consultoria", date: "07/08/2026", amount: "R$ 950,00", status: "Pago" },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" />

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <KpiRow />
        <ChartAndDonut />
        <TransactionsCard />
      </div>
    </>
  );
}

function KpiRow() {
  return (
    <div
      className="soft"
      style={{
        background: "#ffffff",
        borderRadius: "var(--r-card)",
        padding: "var(--space-6)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "var(--space-6)",
        alignItems: "center",
      }}
    >
      <Kpi
        icon={<IconCurrency stroke="var(--color-accent-700)" />}
        iconBg="var(--color-accent-100)"
        label="Faturamento (mês)"
        value="R$ 89.400"
        delta="▲ 14,6%"
        positive
      />
      <Kpi
        icon={<IconUsers stroke="var(--color-neutral-800)" />}
        iconBg="var(--color-neutral-100)"
        label="Clientes ativos"
        value="1.284"
        delta="▲ 8,2%"
        positive
      />
      <Kpi
        icon={<IconBox stroke="var(--color-neutral-800)" />}
        iconBg="var(--color-neutral-100)"
        label="Ticket médio"
        value="R$ 293"
        delta="▼ 1,4%"
      />
    </div>
  );
}

function Kpi({
  icon,
  iconBg,
  label,
  value,
  delta,
  positive,
}: {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", minWidth: 0 }}>
      <div
        style={{
          width: 74,
          height: 74,
          borderRadius: "var(--r-pill)",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, opacity: 0.55, marginBottom: 2 }}>{label}</div>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 30, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>
          <span style={{ color: positive ? "var(--color-accent-700)" : undefined, opacity: positive ? 1 : 0.6, fontWeight: 600 }}>
            {delta}
          </span>{" "}
          <span style={{ opacity: 0.5 }}>vs mês anterior</span>
        </div>
      </div>
    </div>
  );
}

function ChartAndDonut() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-6)", alignItems: "stretch" }}>
      <RevenueChart />
      <CustomersDonut />
    </div>
  );
}

function RevenueChart() {
  return (
    <div
      className="soft"
      style={{
        background: "#ffffff",
        borderRadius: "var(--r-card)",
        padding: "var(--space-6)",
        minWidth: 0,
        flex: "2 1 460px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          flexWrap: "wrap",
          marginBottom: "var(--space-6)",
        }}
      >
        <div>
          <h4 style={{ margin: "0 0 2px" }}>Faturamento mensal</h4>
          <div style={{ fontSize: 12, opacity: 0.5 }}>Últimos 12 meses</div>
        </div>
        <div className="seg" style={{ borderRadius: "var(--r-sm)", borderColor: "var(--color-neutral-300)" }}>
          <label className="seg-opt">
            <input type="radio" name="chart-range" defaultChecked />
            Ano
          </label>
          <label className="seg-opt">
            <input type="radio" name="chart-range" />
            Mês
          </label>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 230 }}>
        {MONTHS.map((m) => (
          <div
            key={m.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              flex: 1,
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            {m.tooltip && (
              <div
                style={{
                  background: "var(--color-text)",
                  color: "#ffffff",
                  borderRadius: "var(--r-sm)",
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {m.tooltip}
              </div>
            )}
            <div
              style={{
                width: "100%",
                height: m.height,
                borderRadius: "var(--r-sm)",
                background: m.highlight ? "var(--color-accent)" : "var(--color-accent-100)",
              }}
            />
            <span style={{ fontSize: 11, opacity: m.highlight ? 1 : 0.5, fontWeight: m.highlight ? 600 : 400 }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomersDonut() {
  const gradient = `conic-gradient(${PLANS.map((p, i) => {
    const start = PLANS.slice(0, i).reduce((s, x) => s + x.pct, 0);
    const end = start + p.pct;
    return `${p.color} ${start}% ${end}%`;
  }).join(", ")})`;

  return (
    <div
      className="soft"
      style={{
        background: "#ffffff",
        borderRadius: "var(--r-card)",
        padding: "var(--space-6)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-4)",
        minWidth: 0,
        flex: "1 1 300px",
      }}
    >
      <div style={{ width: "100%" }}>
        <h4 style={{ margin: "0 0 2px" }}>Clientes</h4>
        <div style={{ fontSize: 12, opacity: 0.5 }}>Distribuição por plano</div>
      </div>

      <div
        style={{
          position: "relative",
          width: "min(200px, 100%)",
          aspectRatio: "1",
          flex: "none",
          borderRadius: "var(--r-pill)",
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: "var(--r-pill)",
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 26, lineHeight: 1.1 }}>1.284</div>
          <div style={{ fontSize: 11, opacity: 0.5 }}>clientes ativos</div>
        </div>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "var(--space-2)", marginTop: "var(--space-2)" }}>
        {PLANS.map((p) => (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: p.color, flex: "none" }} />
            {p.name}
            <strong style={{ marginLeft: "auto" }}>{p.pct}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsCard() {
  return (
    <div
      className="soft"
      style={{ background: "#ffffff", borderRadius: "var(--r-card)", padding: "var(--space-6)" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          flexWrap: "wrap",
          marginBottom: "var(--space-4)",
        }}
      >
        <div>
          <h4 style={{ margin: "0 0 2px" }}>Últimas transações</h4>
          <div style={{ fontSize: 12, color: "var(--color-accent-700)" }}>1.284 clientes ativos este mês</div>
        </div>
        <div style={{ position: "relative", width: 230 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "absolute", left: 12, top: 11, opacity: 0.45 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input className="input" type="text" placeholder="Buscar transação" style={{ paddingLeft: 36 }} />
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Produto</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {TRANSACTIONS.map((tx) => (
            <tr key={tx.client + tx.date}>
              <td>{tx.client}</td>
              <td>{tx.product}</td>
              <td>{tx.date}</td>
              <td>{tx.amount}</td>
              <td>
                <StatusTag status={tx.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusTag({ status }: { status: TxStatus }) {
  const style: Record<TxStatus, { border: string; color: string }> = {
    Pago: { border: "var(--color-accent-700)", color: "var(--color-accent-700)" },
    Pendente: { border: "var(--color-neutral-500)", color: "var(--color-neutral-800)" },
    Cancelado: { border: "var(--color-neutral-400)", color: "var(--color-neutral-700)" },
  };
  const { border, color } = style[status];
  return (
    <span
      className="tag"
      style={{ borderRadius: "var(--r-sm)", border: `1px solid ${border}`, color, padding: "4px 14px" }}
    >
      {status}
    </span>
  );
}

/* — icons — */

function IconCurrency({ stroke }: { stroke: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 6.5H9.8a2.8 2.8 0 0 0 0 5.6h4.4a2.8 2.8 0 0 1 0 5.6H6.5" />
    </svg>
  );
}
function IconUsers({ stroke }: { stroke: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
      <path d="M16 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  );
}
function IconBox({ stroke }: { stroke: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.3 7 12 12 20.7 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  );
}
