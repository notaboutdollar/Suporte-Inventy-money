import { PageHeader } from "../_components/page-header";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/lib/roles";
import { ProfileForm } from "./_components/profile-form";
import { SettingsTabs } from "./_components/settings-tabs";
import { UsersTable, type UserRow } from "./_components/users-table";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <PageHeader title="Configurações" />
        <div
          className="soft"
          style={{ background: "#ffffff", borderRadius: "var(--r-card)", padding: "var(--space-6)" }}
        >
          Sessão inválida.
        </div>
      </>
    );
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("name, role")
    .eq("id", user.id)
    .single();

  const myRole = (me?.role as ProfileRole) ?? "member";
  const myName = me?.name ?? user.email?.split("@")[0] ?? "";

  const tabs: { key: string; label: string; content: React.ReactNode }[] = [
    {
      key: "profile",
      label: "Meu perfil",
      content: <ProfileForm email={user.email ?? ""} name={myName} role={myRole} />,
    },
  ];

  if (myRole === "admin") {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, name, role, approved")
      .order("name");

    const users: UserRow[] = (profilesData ?? []).map((p) => ({
      id: p.id as string,
      name: (p.name as string) ?? "",
      role: p.role as ProfileRole,
      approved: (p.approved as boolean) ?? false,
      isMe: (p.id as string) === user.id,
    }));

    tabs.push({
      key: "users",
      label: "Usuários",
      content: <UsersTable users={users} />,
    });
  }

  return (
    <>
      <PageHeader title="Configurações" />
      <SettingsTabs tabs={tabs} />
    </>
  );
}
