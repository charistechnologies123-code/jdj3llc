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

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return Response.json({ message: "Admin access required." }, { status: 401 });
  }

  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Please complete the product form correctly." }, { status: 400 });
  }

  const data = parsed.data;
  const categorySlug = slugify(data.categoryName);
  const productSlug = slugify(data.name);

  const existing = await db.product.findUnique({
    where: { slug: productSlug },
    select: { id: true },
  });

  if (existing) {
    return Response.json({ message: "A product with that name already exists." }, { status: 409 });
  }

  const product = await db.$transaction(async (tx) => {
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

    const created = await tx.product.create({
      data: {
        name: data.name,
        slug: productSlug,
        categoryId: category.id,
        quantity: data.quantity,
        isFeatured: data.isFeatured,
        summary: data.summary || null,
        description: data.description,
      },
      select: { id: true },
    });

    if (data.imagePath) {
      await tx.productImage.create({
        data: {
          productId: created.id,
          path: data.imagePath,
          isPrimary: true,
          sortOrder: 1,
        },
      });
    }

    return created;
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidateTag("catalog");

  return Response.json({ ok: true, id: product.id });
}
