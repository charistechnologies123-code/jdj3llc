import { cookies } from "next/headers";
import { z } from "zod";

import { db } from "@/lib/db";
import { sendOrderEmails } from "@/lib/email";
import { getSessionFromCookies } from "@/lib/session";

const orderSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
  phoneNumber: z.string().trim().min(5).optional(),
  label: z.string().trim().optional(),
  addressId: z.string().trim().optional(),
  addressLine1: z.string().trim().min(3).optional(),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2).optional(),
  state: z.string().trim().min(2).optional(),
  postalCode: z.string().trim().optional(),
  country: z.string().trim().min(2).optional(),
  notes: z.string().trim().optional(),
  couponCode: z.string().trim().optional(),
  saveAddress: z.boolean().optional(),
  setDefaultAddress: z.boolean().optional(),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});

type ParsedOrder = z.infer<typeof orderSchema>;

function buildDeliveryAddress(input: {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode?: string | null;
  country: string;
}) {
  return [
    input.addressLine1,
    input.addressLine2,
    `${input.city}, ${input.state} ${input.postalCode ?? ""}`.trim(),
    input.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function buildOrderNumber() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const nonce = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JDJ3-${stamp}-${nonce}`;
}

function hasNewAddress(data: ParsedOrder) {
  return Boolean(data.addressLine1 && data.city && data.state && data.country);
}

export async function POST(request: Request) {
  const parsed = orderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ message: "Please complete the checkout form correctly." }, { status: 400 });
  }

  const data = parsed.data;
  const session = getSessionFromCookies(await cookies());
  const productIds = data.items.map((item) => item.id);

  const products = await db.product.findMany({
    where: {
      id: { in: productIds },
      isActive: true,
    },
    include: {
      images: {
        where: { isPrimary: true },
        select: { path: true },
        take: 1,
      },
    },
  });

  if (products.length !== productIds.length) {
    return Response.json({ message: "One or more cart items are no longer available." }, { status: 409 });
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const unavailableItem = data.items.find((item) => {
    const product = productMap.get(item.id);
    return !product || product.quantity < item.quantity;
  });

  if (unavailableItem) {
    const product = productMap.get(unavailableItem.id);
    const productName = product?.name ?? "One of the selected products";
    return Response.json(
      { message: `${productName} does not have enough quantity available for this order.` },
      { status: 409 },
    );
  }
  const coupon = data.couponCode
    ? await db.coupon.findFirst({
        where: {
          code: data.couponCode,
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        select: { id: true, code: true, usageLimit: true },
      })
    : null;

  const user =
    session?.role === "CUSTOMER"
      ? await db.user.findUnique({
          where: { id: session.userId },
          include: {
            addresses: {
              orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
            },
          },
        })
      : null;

  if (!user && data.couponCode) {
    return Response.json({ message: "Guest users are not allowed to use coupon codes." }, { status: 403 });
  }

  if (data.couponCode && !coupon) {
    return Response.json({ message: "That coupon code is not valid right now." }, { status: 404 });
  }

  const [couponUsageCount, existingCouponUsage] =
    user && coupon
      ? await Promise.all([
          db.couponUsage.count({
            where: {
              couponId: coupon.id,
            },
          }),
          db.couponUsage.findUnique({
            where: {
              couponId_userId: {
                couponId: coupon.id,
                userId: user.id,
              },
            },
            select: { id: true },
          }),
        ])
      : [0, null];

  if (user && coupon && existingCouponUsage) {
    return Response.json({ message: "You have already used this coupon code." }, { status: 409 });
  }

  if (coupon?.usageLimit && couponUsageCount >= coupon.usageLimit) {
    return Response.json({ message: "That coupon code has reached its usage limit." }, { status: 409 });
  }

  const guestCheckout = !user;
  let deliveryAddress = "";
  let customerName = "";
  let customerEmail = "";
  let customerPhone = "";
  let addressForSave:
    | {
        label: string | null;
        recipientName: string;
        phoneNumber: string;
        addressLine1: string;
        addressLine2: string | null;
        city: string;
        state: string;
        postalCode: string | null;
        country: string;
        isDefault: boolean;
      }
    | null = null;

  if (guestCheckout) {
    if (!data.name || !data.email || !data.phoneNumber || !hasNewAddress(data)) {
      return Response.json({ message: "Please complete the checkout form correctly." }, { status: 400 });
    }

    customerName = data.name;
    customerEmail = data.email;
    customerPhone = data.phoneNumber;
    deliveryAddress = buildDeliveryAddress({
      addressLine1: data.addressLine1!,
      addressLine2: data.addressLine2,
      city: data.city!,
      state: data.state!,
      postalCode: data.postalCode,
      country: data.country!,
    });
  } else if (data.addressId) {
    const savedAddress = user.addresses.find((address) => address.id === data.addressId);
    if (!savedAddress) {
      return Response.json({ message: "Please choose a valid saved delivery address." }, { status: 400 });
    }

    customerName = user.name;
    customerEmail = user.email;
    customerPhone = savedAddress.phoneNumber || user.phoneNumber || "";
    deliveryAddress = buildDeliveryAddress({
      addressLine1: savedAddress.addressLine1,
      addressLine2: savedAddress.addressLine2,
      city: savedAddress.city ?? "",
      state: savedAddress.state ?? "",
      postalCode: savedAddress.postalCode,
      country: savedAddress.country,
    });
  } else if (hasNewAddress(data)) {
    customerName = user.name;
    customerEmail = user.email;
    customerPhone = user.phoneNumber || "";
    deliveryAddress = buildDeliveryAddress({
      addressLine1: data.addressLine1!,
      addressLine2: data.addressLine2,
      city: data.city!,
      state: data.state!,
      postalCode: data.postalCode,
      country: data.country!,
    });

    addressForSave = {
      label: data.label || null,
      recipientName: user.name,
      phoneNumber: user.phoneNumber || "",
      addressLine1: data.addressLine1!,
      addressLine2: data.addressLine2 || null,
      city: data.city!,
      state: data.state!,
      postalCode: data.postalCode || null,
      country: data.country!,
      isDefault: Boolean(data.setDefaultAddress),
    };
  } else {
    return Response.json({ message: "Please choose a delivery address for this order." }, { status: 400 });
  }

  let order;
  try {
    order = await db.$transaction(async (tx) => {
      for (const item of data.items) {
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.id,
            quantity: {
              gte: item.quantity,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        if (stockUpdate.count === 0) {
          const product = productMap.get(item.id);
          throw new Error(
            `${product?.name ?? "One of the selected products"} is no longer available in the requested quantity.`,
          );
        }
      }

      if (user && addressForSave?.isDefault) {
        await tx.address.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      if (user && addressForSave && data.saveAddress) {
        await tx.address.create({
          data: {
            userId: user.id,
            ...addressForSave,
          },
        });
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: user?.id ?? null,
          addressId: user && data.addressId ? data.addressId : null,
          referredByUserId: user?.referredByUserId ?? null,
          couponId: coupon?.id ?? null,
          orderNumber: buildOrderNumber(),
          userType: user ? "registered" : "guest",
          customerName,
          customerEmail,
          customerPhone,
          deliveryAddress,
          couponCode: coupon?.code ?? null,
          referralCode: user?.referralCode ?? null,
          notes: data.notes,
          submittedAt: new Date(),
          items: {
            create: data.items.map((item) => {
              const product = productMap.get(item.id)!;
              return {
                productId: product.id,
                productName: product.name,
                productSlug: product.slug,
                productImage: product.images[0]?.path ?? null,
                quantity: item.quantity,
              };
            }),
          },
        },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerEmail: true,
          customerPhone: true,
          deliveryAddress: true,
          couponCode: true,
          notes: true,
          userType: true,
          items: {
            select: {
              productName: true,
              quantity: true,
            },
          },
        },
      });

      if (user && coupon) {
        await tx.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId: user.id,
            orderId: createdOrder.id,
            usedAt: new Date(),
          },
        });
      }

      if (user?.referredByUserId) {
        await tx.referral.updateMany({
          where: {
            userId: user.referredByUserId,
            referredUserId: user.id,
          },
          data: {
            orderId: createdOrder.id,
            status: "ORDERED",
            convertedAt: new Date(),
          },
        });
      }

      return createdOrder;
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "One or more products could not be reserved for this order.";

    return Response.json({ message }, { status: 409 });
  }

  let emailResult;
  try {
    emailResult = await sendOrderEmails(order);
  } catch (error) {
    console.error("Order saved but email sending failed.", error);
    emailResult = {
      configured: true,
      customerSent: false,
      organizationSent: false,
      allSent: false,
      errors: [error instanceof Error ? error.message : "Unable to send order emails."],
    };
  }

  return Response.json({
    ok: true,
    orderNumber: order.orderNumber,
    email: emailResult,
  });
}
