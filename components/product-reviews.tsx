"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "@/components/auth-provider";

type ReviewItem = {
  id: string;
  customerName: string;
  rating: number;
  review: string;
  createdAt: string;
};

export function ProductReviews({
  productId,
  productSlug,
  initialReviews,
}: {
  productId: string;
  productSlug: string;
  initialReviews: ReviewItem[];
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  }, [reviews]);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (rating < 1) {
      toast.error("Please choose a star rating.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          rating,
          review: reviewText,
          slug: productSlug,
        }),
      });
      const payload = (await response.json()) as { message?: string; review?: ReviewItem };

      if (!response.ok || !payload.review) {
        toast.error(payload.message ?? "Unable to submit your review.");
        return;
      }

      setReviews((current) => [payload.review!, ...current]);
      setRating(0);
      setHoveredRating(0);
      setReviewText("");
      toast.success("Thanks for sharing your review.");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-8 rounded-[2rem] border border-orange-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-orange-500">Ratings & Reviews</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">What customers are saying</h2>
        </div>
        <div className="rounded-2xl bg-stone-50 px-4 py-3 text-right">
          <p className="text-2xl font-black text-slate-900">{reviews.length > 0 ? averageRating.toFixed(1) : "0.0"}</p>
          <p className="text-sm text-slate-500">{reviews.length} review{reviews.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      <form onSubmit={submitReview} className="mt-6 rounded-3xl bg-stone-50 p-5">
        <p className="text-sm font-semibold text-slate-700">Reviewing as {user?.name ?? "Anonymous"}</p>
        <div className="mt-4 flex gap-1">
          {Array.from({ length: 5 }).map((_, index) => {
            const starValue = index + 1;
            const active = starValue <= (hoveredRating || rating);

            return (
              <button
                key={starValue}
                type="button"
                onMouseEnter={() => setHoveredRating(starValue)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(starValue)}
                className="rounded-2xl p-2 transition hover:bg-orange-100"
                aria-label={`Rate ${starValue} star${starValue === 1 ? "" : "s"}`}
              >
                <Star className={`h-7 w-7 ${active ? "fill-orange-400 text-orange-400" : "text-slate-300"}`} />
              </button>
            );
          })}
        </div>
        <textarea
          rows={5}
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value)}
          placeholder="Tell other customers what you liked about this product."
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
        />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <article key={review.id} className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-900">{review.customerName}</p>
                  <div className="mt-2 flex gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={`${review.id}-${index + 1}`}
                        className={`h-4 w-4 ${index + 1 <= review.rating ? "fill-orange-400 text-orange-400" : "text-slate-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <time className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </time>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">{review.review}</p>
            </article>
          ))
        ) : (
          <div className="rounded-3xl bg-stone-50 p-5 text-sm text-slate-500">
            No reviews yet. Be the first to rate this product.
          </div>
        )}
      </div>
    </section>
  );
}
