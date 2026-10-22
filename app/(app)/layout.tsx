import type { ReactNode } from "react";
import { Sidebar } from "./_components/sidebar";
import { getSessionContext } from "@/lib/session";
import { getTheme } from "@/lib/theme";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const [{ name: profileName, role: profileRole }, theme] = await Promise.all([
    getSessionContext(),
    getTheme(),
  ]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--page-bg)",
        color: "var(--color-text)",
        fontSize: 15,
      }}
    >
      <Sidebar name={profileName} role={profileRole} theme={theme} />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          padding: "var(--space-8) var(--space-8) var(--space-8) var(--space-6)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
