import { cookies } from "next/headers";

export type Theme = "light" | "dark";

export async function getTheme(): Promise<Theme> {
  const value = (await cookies()).get("theme")?.value;
  return value === "dark" ? "dark" : "light";
}
