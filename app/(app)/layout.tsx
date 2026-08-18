import type { ReactNode } from "react";
import { Sidebar } from "./_components/sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
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
      <Sidebar />
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
