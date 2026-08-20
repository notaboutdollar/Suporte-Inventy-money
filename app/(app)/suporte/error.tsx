"use client";

import { useEffect } from "react";

export default function SuporteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[/suporte] render error:", error);
  }, [error]);

  return (
    <div
      className="soft"
      style={{
        background: "#ffffff",
        borderRadius: "var(--r-card)",
        padding: "var(--space-6)",
        margin: "var(--space-6) auto",
        maxWidth: 720,
        color: "var(--color-accent-700)",
      }}
    >
      <h4 style={{ margin: "0 0 var(--space-3)" }}>Falha ao renderizar Suporte</h4>
      <pre style={{ fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {error.message}
        {error.digest ? `\n\ndigest: ${error.digest}` : ""}
      </pre>
      <button className="btn btn-primary" type="button" onClick={reset} style={{ marginTop: "var(--space-4)" }}>
        Tentar de novo
      </button>
    </div>
  );
}
