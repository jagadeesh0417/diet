import { Star } from "lucide-react";

export default function StarRating({ rating = 5, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? "fill-gold text-gold" : "fill-gray-200 text-gray-200"}
        />
      ))}
    </div>
  );
}
