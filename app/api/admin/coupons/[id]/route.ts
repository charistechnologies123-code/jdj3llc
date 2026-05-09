import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const couponSchema = z.object({
  code: z.string().trim().min(3).transform((value) => value.toUpperCase()),
  usageLimit: z.number().int().positive().nullable(),
  description: z.string().trim().optional(),
  expiresAt: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return Response.json({ message: "Admin access required." }, { status: 401 });

  const parsed = couponSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Please complete the coupon form correctly." }, { status: 400 });
  }

  const { id } = await context.params;
  const data = parsed.data;

  await db.coupon.update({
    where: { id },
    data: {
      code: data.code,
      usageLimit: data.usageLimit,
      description: data.description || null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/coupons");
  return Response.json({ ok: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return Response.json({ message: "Admin access required." }, { status: 401 });

  const { id } = await context.params;
  await db.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  return Response.json({ ok: true });
}
