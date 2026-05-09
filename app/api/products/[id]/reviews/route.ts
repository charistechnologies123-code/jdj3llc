import { ReviewStatus } from "@prisma/client";
import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/session";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().min(10),
  slug: z.string().trim().min(1),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Please complete the review form correctly." }, { status: 400 });
  }

  const { id } = await context.params;
  const { rating, review, slug } = parsed.data;
  const session = getSessionFromCookies(await cookies());

  const user =
    session?.role === "CUSTOMER"
      ? await db.user.findUnique({
          where: { id: session.userId },
          select: { id: true, name: true },
        })
      : null;

  const product = await db.product.findFirst({
    where: { id, slug, isActive: true },
    select: { id: true },
  });

  if (!product) {
    return Response.json({ message: "That product could not be found." }, { status: 404 });
  }

  const created = await db.review.create({
    data: {
      productId: product.id,
      userId: user?.id ?? null,
      customerName: user?.name ?? "Anonymous",
      rating,
      review,
      status: ReviewStatus.APPROVED,
      approvedAt: new Date(),
    },
    select: {
      id: true,
      customerName: true,
      rating: true,
      review: true,
      createdAt: true,
    },
  });

  revalidatePath(`/products/${slug}`);
  revalidateTag("catalog");

  return Response.json({
    ok: true,
    review: {
      ...created,
      createdAt: created.createdAt.toISOString(),
    },
  });
}
