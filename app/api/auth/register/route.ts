import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { z } from "zod";

import { db } from "@/lib/db";
import { generateUniqueReferralCode, getAccountSnapshot } from "@/lib/account";
import { hashPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/session";

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phoneNumber: z.string().trim().min(5),
  password: z.string().min(8),
  referralCodeInput: z.string().trim().optional(),
});

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Please fill out all required fields correctly." }, { status: 400 });
  }

  const { name, email, phoneNumber, password, referralCodeInput } = parsed.data;

  const existingUser = await db.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (existingUser) {
    return Response.json({ message: "An account with that email already exists." }, { status: 409 });
  }

  const referrer = referralCodeInput
    ? await db.user.findUnique({
        where: { referralCode: referralCodeInput.toUpperCase() },
        select: { id: true, referralCode: true },
      })
    : null;

  if (referralCodeInput && !referrer) {
    return Response.json({ message: "That referral code could not be found." }, { status: 404 });
  }

  const passwordHash = await hashPassword(password);
  const referralCode = await generateUniqueReferralCode(name);

  const user = await db.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name,
        email,
        phoneNumber,
        passwordHash,
        role: UserRole.CUSTOMER,
        referralCode,
        referredByUserId: referrer?.id ?? null,
      },
      select: { id: true, role: true },
    });

    if (referrer) {
      await tx.referral.create({
        data: {
          userId: referrer.id,
          referredUserId: createdUser.id,
          referralCode: referrer.referralCode ?? referralCodeInput!.toUpperCase(),
        },
      });
    }

    return createdUser;
  });

  const cookieStore = await cookies();
  setSessionCookie(cookieStore, { userId: user.id, role: user.role });
  const snapshot = await getAccountSnapshot(user.id, user.role);
  return Response.json(snapshot, { status: 201 });
}
