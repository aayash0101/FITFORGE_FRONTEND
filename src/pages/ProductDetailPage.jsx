import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import Loader from '../components/ui/Loader.jsx';
import StarRating from '../components/ui/StarRating.jsx';
import toast from 'react-hot-toast';
import {
  FiShoppingCart, FiPackage, FiTruck,
  FiShield, FiChevronLeft, FiUser,
} from 'react-icons/fi';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
      } catch {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart(product._id, quantity);
      toast.success('Added to cart! 🛒');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      return toast.error('Please write a comment');
    }
    try {
      setSubmittingReview(true);
      await api.post(`/products/${id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      // Refresh product to show new review
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) return null;

  const hasDiscount = product.discountPrice > 0;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const isOutOfStock = product.stock === 0;
  const alreadyReviewed = product.reviews?.some(
    (r) => r.user?._id === user?._id || r.user === user?._id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Back Link ── */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-8 transition-colors"
      >
        <FiChevronLeft size={16} /> Back to Products
      </Link>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

        {/* ── Images ── */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden aspect-square">
            <img
              src={product.images[activeImage]?.url}
              alt={product.images[activeImage]?.alt || product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeImage === idx ? 'border-orange-500' : 'border-gray-700'
                  }`}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="flex flex-col">

          {/* Brand + Category */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-orange-400 font-semibold text-sm uppercase tracking-wide">
              {product.brand}
            </span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400 text-sm capitalize">{product.category}</span>
          </div>

          {/* Name */}
          <h1 className="text-3xl font-black text-white mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <StarRating rating={product.ratings} />
              <span className="text-gray-400 text-sm">
                {product.ratings.toFixed(1)} ({product.numReviews} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-black text-white">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="bg-orange-500/20 text-orange-400 text-sm font-bold px-2 py-0.5 rounded-lg">
                  {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-400 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full border border-gray-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <FiPackage size={16} className={isOutOfStock ? 'text-red-400' : 'text-green-400'} />
            <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-400' : 'text-green-400'}`}>
              {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
            </span>
          </div>

          {/* Quantity + Add to Cart */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 mb-8">
              {/* Quantity Selector */}
              <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-xl font-bold"
                >
                  −
                </button>
                <span className="w-12 text-center text-white font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="w-11 h-11 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-xl font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
              >
                <FiShoppingCart size={18} />
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
          )}

          {/* Perks */}
          <div className="border-t border-gray-800 pt-6 grid grid-cols-2 gap-4">
            {[
              { icon: <FiTruck />, text: 'Free delivery over Rs. 5,000' },
              { icon: <FiShield />, text: '100% authentic product' },
            ].map((perk) => (
              <div key={perk.text} className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="text-orange-400">{perk.icon}</span>
                {perk.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reviews Section ── */}
      <div className="border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-8">
          Customer Reviews
          {product.numReviews > 0 && (
            <span className="text-gray-500 font-normal text-lg ml-3">
              ({product.numReviews})
            </span>
          )}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Review List */}
          <div className="space-y-5">
            {product.reviews?.length === 0 ? (
              <p className="text-gray-400">No reviews yet. Be the first!</p>
            ) : (
              product.reviews.map((review, idx) => (
                <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <FiUser size={14} className="text-orange-400" />
                      </div>
                      <span className="text-white font-medium text-sm">{review.name}</span>
                    </div>
                    <StarRating rating={review.rating} size={13} />
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                  <p className="text-gray-600 text-xs mt-2">
                    {new Date(review.createdAt).toLocaleDateString('en-NP', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Write a Review */}
          <div>
            {!user ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                <p className="text-gray-400 mb-4">Login to write a review</p>
                <Link
                  to="/login"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
                >
                  Login
                </Link>
              </div>
            ) : alreadyReviewed ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
                <p className="text-green-400 font-medium">✓ You've already reviewed this product</p>
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-white font-bold mb-5">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Your Rating</label>
                    <StarRating
                      rating={reviewForm.rating}
                      size={28}
                      interactive
                      onRate={(r) => setReviewForm((prev) => ({ ...prev, rating: r }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Your Review</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                      rows={4}
                      placeholder="Share your experience with this product..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;