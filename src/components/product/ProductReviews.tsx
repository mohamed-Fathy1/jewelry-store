"use client";

import { StarIcon } from "@heroicons/react/24/solid";

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
      <h2 className="text-2xl font-light mb-6">Customer Reviews</h2>
      <div className="space-y-8">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-8">
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < review.rating ? "text-yellow-400" : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="ml-4 text-sm text-gray-500">{review.date}</p>
            </div>
            <p className="text-gray-900 mb-2">{review.content}</p>
            <p className="text-sm text-gray-500">By {review.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
