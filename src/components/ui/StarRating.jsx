import { FiStar } from 'react-icons/fi';

const StarRating = ({ rating, size = 16, interactive = false, onRate }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          onClick={() => interactive && onRate(star)}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <FiStar
            size={size}
            className={
              star <= Math.round(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-600'
            }
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;