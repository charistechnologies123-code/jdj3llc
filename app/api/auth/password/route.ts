import { cookies } from "next/headers";
import { z } from "zod";

import { db } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/password";

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(request: Request) {
  const session = getSessionFromCookies(await cookies());
  if (!session || session.role !== "CUSTOMER") {
    return Response.json({ message: "You must be logged in." }, { status: 401 });
  }

  const parsed = passwordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Please provide a valid current and new password." }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, passwordHash: true },
  });

  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return Response.json({ message: "Current password is incorrect." }, { status: 400 });
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
    },
  });

  return Response.json({ ok: true, message: "Password updated." });
}
