"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import { colors } from "@/constants/colors";

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
      <h2
        className="text-2xl font-light mb-6"
        style={{ color: colors.textPrimary }}
      >
        Customer Reviews
      </h2>
      <div className="space-y-8">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="pb-8"
            style={{ borderBottomColor: colors.border }}
          >
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className="h-5 w-5"
                    style={{
                      color: i < review.rating ? colors.gold : colors.border,
                    }}
                  />
                ))}
              </div>
              <p
                className="ml-4 text-sm"
                style={{ color: colors.textSecondary }}
              >
                {review.date}
              </p>
            </div>
            <p className="mb-2" style={{ color: colors.textPrimary }}>
              {review.content}
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              By {review.author}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
