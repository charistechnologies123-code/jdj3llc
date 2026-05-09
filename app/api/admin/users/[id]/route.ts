import { UserRole } from "@prisma/client";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

const userSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().optional(),
  role: z.nativeEnum(UserRole),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return Response.json({ message: "Admin access required." }, { status: 401 });

  const parsed = userSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Please complete the user form correctly." }, { status: 400 });
  }

  const { id } = await context.params;
  const data = parsed.data;

  if (session.userId === id && data.role !== UserRole.ADMIN) {
    return Response.json({ message: "You cannot remove your own admin access." }, { status: 400 });
  }

  await db.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      ...(data.password ? { passwordHash: await hashPassword(data.password) } : {}),
    },
  });

  return Response.json({ ok: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return Response.json({ message: "Admin access required." }, { status: 401 });

  const { id } = await context.params;
  if (session.userId === id) {
    return Response.json({ message: "Admins cannot delete themselves." }, { status: 400 });
  }

  await db.$transaction(async (tx) => {
    await tx.order.updateMany({
      where: { userId: id },
      data: { userId: null },
    });
    await tx.order.updateMany({
      where: { referredByUserId: id },
      data: { referredByUserId: null },
    });
    await tx.referral.updateMany({
      where: { referredUserId: id },
      data: { referredUserId: null },
    });
    await tx.referral.deleteMany({
      where: { userId: id },
    });
    await tx.review.updateMany({
      where: { userId: id },
      data: { userId: null },
    });
    await tx.coupon.updateMany({
      where: { createdByUserId: id },
      data: { createdByUserId: null },
    });
    await tx.couponUsage.deleteMany({
      where: { userId: id },
    });
    await tx.address.deleteMany({
      where: { userId: id },
    });
    await tx.user.delete({ where: { id } });
  });
  return Response.json({ ok: true });
}
