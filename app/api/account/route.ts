import { cookies } from "next/headers";

import { getAccountSnapshot } from "@/lib/account";
import { clearSessionCookie, getSessionFromCookies } from "@/lib/session";

export async function GET() {
  const cookieStore = await cookies();
  const session = getSessionFromCookies(cookieStore);

  if (!session) {
    return Response.json({ user: null, referrals: [] });
  }

  const snapshot = await getAccountSnapshot(session.userId, session.role);

  if (!snapshot.user) {
    clearSessionCookie(cookieStore);
    return Response.json({ user: null, referrals: [] });
  }

  return Response.json(snapshot);
}
