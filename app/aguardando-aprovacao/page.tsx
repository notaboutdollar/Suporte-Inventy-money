import { logout } from "@/lib/actions/auth";
import { InventMoneyLogo } from "@/app/_components/logo";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { getSessionContext } from "@/lib/session";
import { getTheme } from "@/lib/theme";

export default async function AguardandoAprovacaoPage() {
  const [{ email }, theme] = await Promise.all([getSessionContext(), getTheme()]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--page-bg)",
        padding: "var(--space-6)",
      }}
    >
      <div style={{ position: "fixed", top: 16, right: 16 }}>
        <ThemeToggle compact initial={theme} />
      </div>
      <div
        className="soft"
        style={{
          width: "min(440px, 100%)",
          background: "var(--color-card)",
          borderRadius: "var(--r-card)",
          padding: "var(--space-8)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <InventMoneyLogo size={64} />

        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--r-pill)",
            background: "var(--color-accent-100)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-accent-700)",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15.5 14" />
          </svg>
        </div>

        <div>
          <h3 style={{ margin: "0 0 var(--space-2)" }}>Aguardando aprovação</h3>
          <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>
            Seu cadastro foi recebido. Um administrador precisa aprovar seu acesso antes de você entrar no CRM.
          </p>
          {email && (
            <p style={{ fontSize: 12, opacity: 0.55, marginTop: "var(--space-3)" }}>
              Logado como <strong>{email}</strong>
            </p>
          )}
        </div>

        <form action={logout} style={{ width: "100%" }}>
          <button className="btn btn-secondary btn-block" type="submit" style={{ justifyContent: "center" }}>
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
