import { PageHeader } from "../_components/page-header";

export default function KanbanPage() {
  return (
    <>
      <PageHeader title="Kanban" />
      <div
        className="soft"
        style={{
          background: "#ffffff",
          borderRadius: "var(--r-card)",
          padding: "var(--space-8)",
          textAlign: "center",
          opacity: 0.7,
        }}
      >
        <h4 style={{ margin: "0 0 var(--space-2)" }}>Em construção</h4>
        <div style={{ fontSize: 13 }}>
          Pipeline de afiliados em colunas arrastáveis chega na próxima etapa.
        </div>
      </div>
    </>
  );
}
