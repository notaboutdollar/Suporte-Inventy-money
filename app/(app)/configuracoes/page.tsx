import { PageHeader } from "../_components/page-header";

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader title="Configurações" />
      <div
        className="soft"
        style={{
          background: "#ffffff",
          borderRadius: "var(--r-card)",
          padding: "var(--space-8)",
        }}
      >
        <h4 style={{ margin: 0 }}>Em construção</h4>
        <p style={{ marginTop: "var(--space-3)", opacity: 0.65 }}>
          Perfil, empresa, notificações e gerenciamento chegam depois do auth.
        </p>
      </div>
    </>
  );
}
