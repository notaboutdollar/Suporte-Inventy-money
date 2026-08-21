import Link from "next/link";
import { signup } from "@/lib/actions/auth";
import { InventMoneyLogo } from "@/app/_components/logo";

export default async function SignupPage({
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
          width: "min(400px, 100%)",
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
          <h3 style={{ margin: "0 0 4px" }}>Criar conta</h3>
          <div style={{ fontSize: 13, opacity: 0.55 }}>
            Novo cadastro precisa ser aprovado por um admin antes de acessar o sistema.
          </div>
        </div>

        <form action={signup} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div className="field">
            <label htmlFor="name">Nome completo</label>
            <input className="input" id="name" name="name" type="text" required autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input className="input" id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              className="input"
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
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
            Solicitar acesso
          </button>
        </form>

        <div style={{ fontSize: 13, opacity: 0.65, textAlign: "center" }}>
          Já tem conta? <Link href="/login">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
