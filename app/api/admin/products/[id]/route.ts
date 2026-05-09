import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slugs";

const productSchema = z.object({
  name: z.string().trim().min(2),
  categoryName: z.string().trim().min(2),
  quantity: z.number().int().min(0),
  isFeatured: z.boolean().default(false),
  summary: z.string().trim().optional(),
  description: z.string().trim().min(10),
  imagePath: z.string().trim().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return Response.json({ message: "Admin access required." }, { status: 401 });
  }

  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Please complete the product form correctly." }, { status: 400 });
  }

  const { id } = await context.params;
  const data = parsed.data;
  const categorySlug = slugify(data.categoryName);
  const productSlug = slugify(data.name);

  await db.$transaction(async (tx) => {
    const category = await tx.category.upsert({
      where: { slug: categorySlug },
      update: {
        name: data.categoryName,
        isActive: true,
      },
      create: {
        name: data.categoryName,
        slug: categorySlug,
        isActive: true,
      },
      select: { id: true },
    });

    await tx.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: productSlug,
        categoryId: category.id,
        quantity: data.quantity,
        isFeatured: data.isFeatured,
        summary: data.summary || null,
        description: data.description,
      },
    });

    await tx.productImage.deleteMany({
      where: { productId: id },
    });

    if (data.imagePath) {
      await tx.productImage.create({
        data: {
          productId: id,
          path: data.imagePath,
          isPrimary: true,
          sortOrder: 1,
        },
      });
    }
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/shop");
  revalidatePath("/");
  revalidateTag("catalog");

  return Response.json({ ok: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return Response.json({ message: "Admin access required." }, { status: 401 });
  }

  const { id } = await context.params;

  await db.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.product.delete({ where: { id } });
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidateTag("catalog");

  return Response.json({ ok: true });
}
