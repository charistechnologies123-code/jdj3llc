import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const testimonialSchema = z.object({
  name: z.string().trim().min(2),
  message: z.string().trim().min(10),
  imagePath: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return Response.json({ message: "Admin access required." }, { status: 401 });

  const parsed = testimonialSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Please complete the testimonial form correctly." }, { status: 400 });
  }

  const { id } = await context.params;

  await db.testimonial.update({
    where: { id },
    data: {
      ...parsed.data,
      imagePath: parsed.data.imagePath || null,
    },
  });

  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");

  return Response.json({ ok: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return Response.json({ message: "Admin access required." }, { status: 401 });

  const { id } = await context.params;
  await db.testimonial.delete({ where: { id } });

  revalidatePath("/admin/testimonials");
  revalidatePath("/testimonials");
  revalidatePath("/");

  return Response.json({ ok: true });
}
