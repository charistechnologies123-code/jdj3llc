import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { z } from "zod";

import { getAccountSnapshot } from "@/lib/account";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getSessionFromCookies } from "@/lib/session";

const profileSchema = z.object({
  avatarPath: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

export async function PATCH(request: Request) {
  const session = getSessionFromCookies(await cookies());
  if (!session || session.role !== "ADMIN") {
    return Response.json({ message: "Admin access required." }, { status: 401 });
  }

  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Invalid profile update." }, { status: 400 });
  }

  const { avatarPath, currentPassword, newPassword } = parsed.data;
  const updates: { avatarPath?: string; passwordHash?: string } = {};

  if (typeof avatarPath === "string") {
    updates.avatarPath = avatarPath;
  }

  if (newPassword) {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { passwordHash: true },
    });

    const plainFallback = user?.passwordHash === currentPassword;
    const passwordOk = plainFallback || (await verifyPassword(currentPassword ?? "", user?.passwordHash ?? null));

    if (!passwordOk) {
      return Response.json({ message: "Current password is incorrect." }, { status: 400 });
    }

    updates.passwordHash = await hashPassword(newPassword);
  }

  await db.user.update({
    where: { id: session.userId },
    data: updates,
  });

  if (typeof avatarPath === "string") {
    revalidateTag("branding");
  }

  return Response.json(await getAccountSnapshot(session.userId, session.role));
}
