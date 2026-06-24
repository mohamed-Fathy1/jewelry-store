"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/cn";

const reviews = [
  {
    id: 1,
    rating: 5,
    content: "Beautiful piece of jewelry, exactly as described!",
    author: "Sarah Johnson",
    date: "2 months ago",
  },
  {
    id: 2,
    rating: 4,
    content: "Great quality, but shipping took longer than expected.",
    author: "Michael Brown",
    date: "1 month ago",
  },
];

export default function ProductReviews() {
  return (
    <div>
      <h2 className="mb-6 font-display text-2xl text-heading">
        Customer Reviews
      </h2>
      <div className="space-y-8">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-hairline pb-8">
            <div className="mb-4 flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < review.rating ? "text-accent" : "text-hairline"
                    )}
                  />
                ))}
              </div>
              <p className="ml-4 text-sm text-ink-muted">{review.date}</p>
            </div>
            <p className="mb-2 text-ink">{review.content}</p>
            <p className="text-sm text-ink-muted">By {review.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
