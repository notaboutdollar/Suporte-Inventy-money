import { ThemeToggle } from "@/app/_components/theme-toggle";
import { getTheme } from "@/lib/theme";

export default async function Loading() {
  const theme = await getTheme();

  return (
    <div aria-busy="true" aria-live="polite" aria-label="Carregando" style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-6)",
          flexWrap: "wrap",
          marginBottom: "var(--space-2)",
        }}
      >
        <div style={{ marginRight: "auto" }}>
          <div className="skeleton" style={{ width: 220, height: 32, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: 280, height: 14 }} />
        </div>
        <ThemeToggle initial={theme} />
      </div>
      <div className="skeleton soft" style={{ height: 120, borderRadius: "var(--r-card)" }} />
      <div className="skeleton soft" style={{ height: 320, borderRadius: "var(--r-card)" }} />
    </div>
  );
}
