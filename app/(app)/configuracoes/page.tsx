import { PageHeader } from "../_components/page-header";
import { getSessionContext } from "@/lib/session";
import type { ProfileRole } from "@/lib/roles";
import { ProfileForm } from "./_components/profile-form";
import { SettingsTabs } from "./_components/settings-tabs";
import { UsersTable, type UserRow } from "./_components/users-table";

export default async function ConfiguracoesPage() {
  const { supabase, userId, email, name, role } = await getSessionContext();

  if (!userId) {
    return (
      <>
        <PageHeader title="Configurações" />
        <div
          className="soft"
          style={{ background: "var(--color-card)", borderRadius: "var(--r-card)", padding: "var(--space-6)" }}
        >
          Sessão inválida.
        </div>
      </>
    );
  }

  const myRole = role;
  const myName = name || email?.split("@")[0] || "";

  const tabs: { key: string; label: string; content: React.ReactNode }[] = [
    {
      key: "profile",
      label: "Meu perfil",
      content: <ProfileForm email={email ?? ""} name={myName} role={myRole} />,
    },
  ];

  if (myRole === "admin") {
    const { data: profilesData } = await supabase.rpc("admin_list_profiles");

    const users: UserRow[] = (profilesData ?? []).map((p: {
      id: string;
      name: string | null;
      role: string;
      approved: boolean;
      email: string;
    }) => ({
      id: p.id,
      name: p.name ?? "",
      email: p.email,
      role: p.role as ProfileRole,
      approved: p.approved,
      isMe: p.id === userId,
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
