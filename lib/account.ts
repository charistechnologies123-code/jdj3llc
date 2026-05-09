import { Prisma, UserRole } from "@prisma/client";

import type { AuthAddress, AuthUser, ReferralActivity } from "@/lib/auth-types";
import { db } from "@/lib/db";

const userAccountSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  avatarPath: true,
  role: true,
  referralCode: true,
  referredByUserId: true,
  addresses: {
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      label: true,
      recipientName: true,
      phoneNumber: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
      isDefault: true,
    },
  },
});

const userLoginSelect = Prisma.validator<Prisma.UserSelect>()({
  ...userAccountSelect,
  passwordHash: true,
});

type UserAccountRecord = Prisma.UserGetPayload<{ select: typeof userAccountSelect }>;
type UserLoginRecord = Prisma.UserGetPayload<{ select: typeof userLoginSelect }>;

function serializeAddress(address: UserAccountRecord["addresses"][number]): AuthAddress {
  return {
    id: address.id,
    label: address.label ?? "",
    recipientName: address.recipientName,
    phoneNumber: address.phoneNumber,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    postalCode: address.postalCode ?? "",
    country: address.country,
    isDefault: address.isDefault,
  };
}

export function serializeUser(user: UserAccountRecord): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber ?? "",
    avatarPath: user.avatarPath ?? "",
    role: user.role,
    referralCode: user.referralCode ?? "",
    referredByUserId: user.referredByUserId,
    addresses: user.addresses.map(serializeAddress),
  };
}

export async function getUserForLogin(email: string, role: UserRole) {
  return db.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
      role,
    },
    select: userLoginSelect,
  });
}

export async function getAccountSnapshot(userId: string, role: UserRole) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: userAccountSelect,
  });

  if (!user) {
    return {
      user: null,
      referrals: [] as ReferralActivity[],
    };
  }

  const referrals =
    user.role === "CUSTOMER"
      ? await db.referral.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            referralCode: true,
            status: true,
            createdAt: true,
            order: {
              select: {
                orderNumber: true,
              },
            },
            referredUser: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        })
      : [];

  return {
    user: serializeUser(user),
    referrals: referrals.map<ReferralActivity>((referral) => ({
      id: referral.id,
      referralCode: referral.referralCode,
      status: referral.status,
      referredUserName: referral.referredUser?.name ?? null,
      referredUserEmail: referral.referredUser?.email ?? null,
      orderNumber: referral.order?.orderNumber ?? null,
      createdAt: referral.createdAt.toISOString(),
    })),
  };
}

export async function generateUniqueReferralCode(name: string) {
  const stem = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "JDJ3";

  for (let index = 0; index < 10; index += 1) {
    const candidate = `${stem}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const existing = await db.user.findUnique({
      where: { referralCode: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  return `${stem}${Date.now().toString().slice(-6)}`;
}

export type { UserLoginRecord };
