import { UserRole } from "@prisma/client";
import { z } from "zod";

import { requireAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

const userSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
});

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return Response.json({ message: "Admin access required." }, { status: 401 });

  const parsed = userSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Please complete the user form correctly." }, { status: 400 });
  }

  const data = parsed.data;
  const existing = await db.user.findFirst({
    where: { email: { equals: data.email, mode: "insensitive" } },
    select: { id: true },
  });

  if (existing) {
    return Response.json({ message: "A user with that email already exists." }, { status: 409 });
  }

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      passwordHash: await hashPassword(data.password),
    },
  });

  return Response.json({ ok: true, id: user.id });
}
