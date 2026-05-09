import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

export const getBranding = unstable_cache(
  async () => {
    const admin = await db.user.findFirst({
      where: {
        role: "ADMIN",
        avatarPath: {
          not: null,
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      select: {
        avatarPath: true,
        name: true,
      },
    });

    return {
      logoPath: admin?.avatarPath ?? "",
      name: admin?.name ?? "JDJ3 LLC",
    };
  },
  ["branding-logo"],
  { revalidate: 60, tags: ["branding"] },
);

export async function getAdminDashboardData() {
  const [orders, products, users, pendingReviews, referrals, recentOrders, recentProducts] =
    await Promise.all([
      db.order.count(),
      db.product.count(),
      db.user.count(),
      db.review.count({ where: { status: "PENDING" } }),
      db.referral.count(),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          status: true,
        },
      }),
      db.product.findMany({
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 5,
        select: {
          id: true,
          name: true,
          quantity: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
    ]);

  return {
    stats: {
      orders,
      products,
      users,
      pending_reviews: pendingReviews,
      referrals,
    },
    recentOrders,
    recentProducts,
  };
}

export async function getAdminProducts() {
  return db.product.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      quantity: true,
      isFeatured: true,
      category: {
        select: {
          name: true,
        },
      },
      images: {
        where: { isPrimary: true },
        take: 1,
        select: {
          path: true,
        },
      },
    },
  });
}

export async function getAdminUsersDetailed() {
  return db.user.findMany({
    orderBy: [{ role: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarPath: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
          referredUsers: true,
        },
      },
    },
  });
}

export async function getAdminCategories() {
  return db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function getAdminProductById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
    },
  });
}

export async function getAdminOrders() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      userType: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function getAdminOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getAdminUsers() {
  return getAdminUsersDetailed();
}

export async function getAdminReviews() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      customerName: true,
      rating: true,
      review: true,
      createdAt: true,
      product: {
        select: {
          name: true,
        },
      },
    },
  });

  return reviews.map((review) => ({
    ...review,
    createdAt: review.createdAt.toISOString(),
  }));
}

export async function getAdminCoupons() {
  return db.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          usage: true,
        },
      },
    },
  });
}

export async function getAdminFaqs() {
  return db.faq.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getAdminTestimonials() {
  return db.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}
