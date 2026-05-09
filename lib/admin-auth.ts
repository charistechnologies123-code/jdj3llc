import { cookies } from "next/headers";

import { getSessionFromCookies } from "@/lib/session";

export async function requireAdminSession() {
  const session = getSessionFromCookies(await cookies());
  if (!session || session.role !== "ADMIN") {
    return null;
  }

  return session;
}
