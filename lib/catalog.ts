import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";

type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  summary: string | null;
  requestPriceLabel: string;
  quantity: number;
  category: {
    name: string;
    slug: string;
  } | null;
  primaryImage: {
    path: string;
    altText: string | null;
  } | null;
};

type ProductDetail = CatalogProduct & {
  description: string;
  images: Array<{
    id: string;
    path: string;
    altText: string | null;
    isPrimary: boolean;
  }>;
  reviews: Array<{
    id: string;
    customerName: string;
    rating: number;
    review: string;
    createdAt: string;
  }>;
};

export async function getCatalogCategories() {
  try {
    return await getCatalogCategoriesCached();
  } catch {
    return [];
  }
}

export async function getCatalogProducts() {
  try {
    const products = await getCatalogProductsCached();

    return products.map<CatalogProduct>((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      summary: product.summary,
      requestPriceLabel: product.requestPriceLabel,
      quantity: product.quantity,
      category: product.category,
      primaryImage: product.images[0] ?? null,
    }));
  } catch {
    return [];
  }
}

export async function getCatalogSnapshot() {
  try {
    const [productCount, categoryCount, featuredCount] = await getCatalogSnapshotCached();

    return {
      productCount,
      categoryCount,
      featuredCount,
      isConnected: true,
    };
  } catch {
    return {
      productCount: 0,
      categoryCount: 0,
      featuredCount: 0,
      isConnected: false,
    };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await getProductBySlugCached(slug);

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      summary: product.summary,
      requestPriceLabel: product.requestPriceLabel,
      quantity: product.quantity,
      category: product.category,
      primaryImage: product.images[0]
        ? {
            path: product.images[0].path,
            altText: product.images[0].altText,
          }
        : null,
      description: product.description,
      images: product.images,
      reviews: product.reviews.map((review) => ({
        id: review.id,
        customerName: review.customerName,
        rating: review.rating,
        review: review.review,
        createdAt: review.createdAt.toISOString(),
      })),
    } satisfies ProductDetail;
  } catch {
    return null;
  }
}

export async function getFeaturedProducts() {
  try {
    const products = await getFeaturedProductsCached();

    return products.map<CatalogProduct>((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      summary: product.summary,
      requestPriceLabel: product.requestPriceLabel,
      quantity: product.quantity,
      category: product.category,
      primaryImage: product.images[0] ?? null,
    }));
  } catch {
    return [];
  }
}

export async function getFaqs() {
  try {
    return await getFaqsCached();
  } catch {
    return [];
  }
}

export async function getTestimonials() {
  try {
    return await getTestimonialsCached();
  } catch {
    return [];
  }
}

const getCatalogCategoriesCached = unstable_cache(
  async () =>
    db.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
  ["catalog-categories"],
  { revalidate: 60, tags: ["catalog"] },
);

const getCatalogProductsCached = unstable_cache(
  async () =>
    db.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          where: {
            isPrimary: true,
          },
          select: {
            path: true,
            altText: true,
          },
          take: 1,
        },
      },
    }),
  ["catalog-products"],
  { revalidate: 60, tags: ["catalog"] },
);

const getCatalogSnapshotCached = unstable_cache(
  async () =>
    Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.category.count({ where: { isActive: true } }),
      db.product.count({ where: { isActive: true, isFeatured: true } }),
    ]),
  ["catalog-snapshot"],
  { revalidate: 60, tags: ["catalog"] },
);

const getProductBySlugCached = unstable_cache(
  async (slug: string) =>
    db.product.findFirst({
      where: {
        slug,
        isActive: true,
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
          select: {
            id: true,
            path: true,
            altText: true,
            isPrimary: true,
          },
        },
        reviews: {
          where: {
            status: "APPROVED",
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            customerName: true,
            rating: true,
            review: true,
            createdAt: true,
          },
        },
      },
    }),
  ["catalog-product-by-slug"],
  { revalidate: 60, tags: ["catalog"] },
);

const getFeaturedProductsCached = unstable_cache(
  async () =>
    db.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 8,
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        images: {
          where: {
            isPrimary: true,
          },
          select: {
            path: true,
            altText: true,
          },
          take: 1,
        },
      },
    }),
  ["catalog-featured-products"],
  { revalidate: 60, tags: ["catalog"] },
);

const getFaqsCached = unstable_cache(
  async () =>
    db.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ["catalog-faqs"],
  { revalidate: 120, tags: ["catalog"] },
);

const getTestimonialsCached = unstable_cache(
  async () =>
    db.testimonial.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ["catalog-testimonials"],
  { revalidate: 120, tags: ["catalog"] },
);
