import { cookies } from "next/headers";

import { clearSessionCookie } from "@/lib/session";

export async function POST() {
  clearSessionCookie(await cookies());
  return Response.json({ ok: true });
}
