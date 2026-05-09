import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { z } from "zod";

import { getAccountSnapshot, getUserForLogin } from "@/lib/account";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";
import { verifyPassword } from "@/lib/password";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.nativeEnum(UserRole).default(UserRole.CUSTOMER),
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Please provide a valid email and password." }, { status: 400 });
  }

  const { email, password, role } = parsed.data;
  const cookieStore = await cookies();

  const user = await getUserForLogin(email, role);
  let passwordMatches = user ? await verifyPassword(password, user.passwordHash) : false;

  if (user && !passwordMatches && user.passwordHash === password) {
    passwordMatches = true;
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(password),
        lastSeenAt: new Date(),
      },
    });
  } else if (user && passwordMatches) {
    await db.user.update({
      where: { id: user.id },
      data: {
        lastSeenAt: new Date(),
      },
    });
  }

  if (!user || !passwordMatches) {
    return Response.json({ message: "The provided credentials do not match our records." }, { status: 401 });
  }

  setSessionCookie(cookieStore, { userId: user.id, role: user.role });
  const snapshot = await getAccountSnapshot(user.id, user.role);
  return Response.json(snapshot);
}
