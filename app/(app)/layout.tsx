import type { ReactNode } from "react";
import { Sidebar } from "./_components/sidebar";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/lib/roles";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileName = user?.email?.split("@")[0] ?? "";
  let profileRole: ProfileRole = "member";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", user.id)
      .single();
    if (profile) {
      profileName = (profile.name as string) || profileName;
      profileRole = profile.role as ProfileRole;
    }
  }

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
      <Sidebar name={profileName} role={profileRole} />
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
