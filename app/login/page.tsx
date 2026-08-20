import { login } from "@/lib/actions/auth";
import { InventMoneyLogo } from "@/app/_components/logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
      <div
        className="soft"
        style={{
          width: "min(380px, 100%)",
          background: "#ffffff",
          borderRadius: "var(--r-card)",
          padding: "var(--space-8)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <InventMoneyLogo size={64} />
        </div>

        <div>
          <h3 style={{ margin: "0 0 4px" }}>Entrar</h3>
          <div style={{ fontSize: 13, opacity: 0.55 }}>Acesso interno — NIDO Support CRM</div>
        </div>

        <form action={login} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input className="input" id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <input className="input" id="password" name="password" type="password" required autoComplete="current-password" />
          </div>

          {error && (
            <div
              style={{
                fontSize: 13,
                color: "var(--color-accent-700)",
                background: "var(--color-accent-100)",
                borderRadius: "var(--r-sm)",
                padding: "var(--space-2) var(--space-3)",
              }}
            >
              {error}
            </div>
          )}

          <button className="btn btn-primary" type="submit" style={{ justifyContent: "center", marginTop: "var(--space-2)" }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
