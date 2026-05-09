import { cookies } from "next/headers";
import { z } from "zod";

import { getAccountSnapshot } from "@/lib/account";
import { db } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/session";

const addressSchema = z.object({
  label: z.string().trim().optional(),
  recipientName: z.string().trim().min(2),
  phoneNumber: z.string().trim().min(5),
  addressLine1: z.string().trim().min(3),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  postalCode: z.string().trim().optional(),
  country: z.string().trim().min(2),
  isDefault: z.boolean().default(false),
});

export async function POST(request: Request) {
  const session = getSessionFromCookies(await cookies());
  if (!session || session.role !== "CUSTOMER") {
    return Response.json({ message: "You must be logged in." }, { status: 401 });
  }

  const parsed = addressSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Please complete the address form correctly." }, { status: 400 });
  }

  const data = parsed.data;

  await db.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId: session.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    await tx.address.create({
      data: {
        userId: session.userId,
        label: data.label,
        recipientName: data.recipientName,
        phoneNumber: data.phoneNumber,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: data.isDefault,
      },
    });
  });

  const snapshot = await getAccountSnapshot(session.userId, session.role);
  return Response.json(snapshot);
}
