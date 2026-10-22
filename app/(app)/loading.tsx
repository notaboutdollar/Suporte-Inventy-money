export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" aria-label="Carregando" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div>
        <div className="skeleton" style={{ width: 220, height: 32, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: 280, height: 14 }} />
      </div>
      <div className="skeleton soft" style={{ height: 120, borderRadius: "var(--r-card)" }} />
      <div className="skeleton soft" style={{ height: 320, borderRadius: "var(--r-card)" }} />
    </div>
  );
}
