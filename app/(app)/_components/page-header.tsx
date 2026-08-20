import { createClient } from "@/lib/supabase/server";

async function greeting() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Olá 👋";

  const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
  const name = ((profile?.name as string) || user.email?.split("@")[0] || "").trim();
  const firstName = name.split(/\s+/)[0] || name;
  return `Olá ${firstName}, bem-vindo de volta 👋`;
}

export async function PageHeader({ title }: { title: string }) {
  const hello = await greeting();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-6)",
        flexWrap: "wrap",
        marginBottom: "var(--space-8)",
      }}
    >
      <div style={{ marginRight: "auto" }}>
        <h2 style={{ margin: "0 0 2px" }}>{title}</h2>
        <div style={{ fontSize: 13, opacity: 0.55 }}>{hello}</div>
      </div>

      <div style={{ position: "relative", width: 300 }}>
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "absolute", left: 14, top: 12, opacity: 0.45 }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="input soft"
          type="text"
          placeholder="Buscar clientes, pedidos..."
          style={{
            paddingLeft: 42,
            minHeight: 42,
            background: "#ffffff",
            border: "none",
            borderRadius: "var(--r-md)",
          }}
        />
      </div>

      <button
        className="btn btn-icon soft"
        aria-label="Notificações"
        style={{ background: "#ffffff", borderRadius: "var(--r-md)", width: 42, height: 42 }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      </button>
    </header>
  );
}
