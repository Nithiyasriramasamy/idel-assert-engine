import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0-5, can be fractional
  reviewCount?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, reviewCount }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center space-x-1 text-xs text-yellow-500">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-4 w-4 fill-current" />
      ))}
      {halfStar && <Star key="half" className="h-4 w-4 fill-current opacity-50" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      ))}
      {reviewCount !== undefined && (
        <span className="ml-2 text-xs text-slate-500">({reviewCount})</span>
      )}
    </div>
  );
};

export default StarRating;
