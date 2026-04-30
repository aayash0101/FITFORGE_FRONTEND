import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatPrice } from '../../utils/formatPrice.js';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault(); // prevent navigating to product page
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    try {
      await addToCart(product._id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    }
  };

  const hasDiscount = product.discountPrice > 0;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-800 aspect-square">
        <img
          src={product.images[0]?.url}
          alt={product.images[0]?.alt || product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              SALE
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">
              OUT OF STOCK
            </span>
          )}
          {product.isFeatured && !isOutOfStock && (
            <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full border border-yellow-500/30">
              FEATURED
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand + Category */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-orange-400 font-semibold uppercase tracking-wide">
            {product.brand}
          </span>
          <span className="text-xs text-gray-500 capitalize">{product.category}</span>
        </div>

        {/* Name */}
        <h3 className="text-white font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <FiStar size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs text-gray-400">
              {product.ratings.toFixed(1)} ({product.numReviews})
            </span>
          </div>
        )}

        {/* Price + Cart Button */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800">
          <div>
            <span className="text-white font-bold text-lg">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-gray-500 text-xs line-through ml-2">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
            title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
          >
            <FiShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;