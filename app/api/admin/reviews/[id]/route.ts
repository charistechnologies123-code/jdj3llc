import { ReviewStatus } from "@prisma/client";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const reviewSchema = z.object({
  status: z.nativeEnum(ReviewStatus),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return Response.json({ message: "Admin access required." }, { status: 401 });

  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Invalid review status." }, { status: 400 });
  }

  const { id } = await context.params;
  const { status } = parsed.data;

  await db.review.update({
    where: { id },
    data: {
      status,
      approvedAt: status === ReviewStatus.APPROVED ? new Date() : null,
    },
  });

  return Response.json({ ok: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return Response.json({ message: "Admin access required." }, { status: 401 });

  const { id } = await context.params;
  await db.review.delete({ where: { id } });
  return Response.json({ ok: true });
}
