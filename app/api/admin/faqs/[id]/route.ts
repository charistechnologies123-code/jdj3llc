import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";

const faqSchema = z.object({
  question: z.string().trim().min(5),
  answer: z.string().trim().min(10),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return Response.json({ message: "Admin access required." }, { status: 401 });

  const parsed = faqSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Please complete the FAQ form correctly." }, { status: 400 });
  }

  const { id } = await context.params;
  await db.faq.update({ where: { id }, data: parsed.data });

  revalidatePath("/admin/faqs");
  revalidatePath("/faqs");
  revalidatePath("/");
  revalidateTag("catalog");

  return Response.json({ ok: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return Response.json({ message: "Admin access required." }, { status: 401 });

  const { id } = await context.params;
  await db.faq.delete({ where: { id } });

  revalidatePath("/admin/faqs");
  revalidatePath("/faqs");
  revalidatePath("/");
  revalidateTag("catalog");

  return Response.json({ ok: true });
}
