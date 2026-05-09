"use client";

import { Star } from "lucide-react";

type ReviewRow = {
  id: string;
  customerName: string;
  rating: number;
  review: string;
  createdAt: string;
  product: { name: string };
};

export function AdminReviewsManager({ initialReviews }: { initialReviews: ReviewRow[] }) {
  return (
    <div className="space-y-4">
      {initialReviews.map((review) => (
        <div key={review.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">{review.product.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{review.customerName}</p>
              <div className="mt-2 flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`${review.id}-${index + 1}`}
                    className={`h-4 w-4 ${index + 1 <= review.rating ? "fill-orange-400 text-orange-400" : "text-slate-300"}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
          <p className="mt-5 rounded-3xl bg-stone-50 p-4 text-sm leading-6 text-slate-700">{review.review}</p>
        </div>
      ))}
    </div>
  );
}
