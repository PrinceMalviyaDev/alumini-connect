import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, size = 'md', interactive = false, onChange }: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.floor(rating);
        const half = !filled && star === Math.ceil(rating) && rating % 1 >= 0.5;

        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`${sizeClasses[size]} ${
                filled
                  ? 'fill-yellow-400 text-yellow-400'
                  : half
                  ? 'fill-yellow-200 text-yellow-400'
                  : 'fill-gray-200 text-gray-300 dark:fill-gray-600 dark:text-gray-600'
              }`}
            />
          </button>
        );
      })}
      {!interactive && (
        <span className={`ml-1 text-gray-600 dark:text-gray-400 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {rating > 0 ? rating.toFixed(1) : 'N/A'}
        </span>
      )}
    </div>
  );
}
