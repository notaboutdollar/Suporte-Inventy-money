import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRole } from "@/lib/roles";

const ROLES: ProfileRole[] = ["admin", "gerente", "moderator", "member"];

function asRole(value: unknown): ProfileRole {
  return ROLES.includes(value as ProfileRole) ? (value as ProfileRole) : "member";
}

export async function getActor() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  return { supabase, userId, email };
}

export const getSessionContext = cache(async () => {
  const actor = await getActor();
  let name = actor.email?.split("@")[0] ?? "";
  let role: ProfileRole = "member";

  if (actor.userId) {
    const { data: profile } = await actor.supabase
      .from("profiles")
      .select("name, role")
      .eq("id", actor.userId)
      .single();
    if (profile) {
      name = (profile.name as string) || name;
      role = asRole(profile.role);
    }
  }

  return { ...actor, name, role };
});
