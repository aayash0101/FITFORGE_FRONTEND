import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import Loader from '../components/ui/Loader.jsx';
import toast from 'react-hot-toast';
import { FiTrash2, FiShoppingBag, FiArrowRight, FiMinus, FiPlus } from 'react-icons/fi';

const CartPage = () => {
  const { user } = useAuth();
  const { cart, cartLoading, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return;
    try {
      await updateItem(productId, newQty);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update quantity');
    }
  };

  const handleRemove = async (productId, name) => {
    try {
      await removeItem(productId);
      toast.success(`${name} removed from cart`);
    } catch {
      toast.error('Could not remove item');
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      toast.success('Cart cleared');
    } catch {
      toast.error('Could not clear cart');
    }
  };

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <FiShoppingBag size={60} className="text-gray-700 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-400 mb-6">Login to view your cart</p>
        <Link
          to="/login"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Login
        </Link>
      </div>
    );
  }

  if (cartLoading) return <Loader />;

  const isEmpty = !cart || cart.items.length === 0;
  const shippingPrice = cart?.totalPrice >= 5000 ? 0 : 150;
  const grandTotal = (cart?.totalPrice || 0) + shippingPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-white">
          Your Cart
          {!isEmpty && (
            <span className="text-gray-500 font-normal text-lg ml-3">
              ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
            </span>
          )}
        </h1>
        {!isEmpty && (
          <button
            onClick={handleClear}
            className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1.5 transition-colors"
          >
            <FiTrash2 size={14} /> Clear Cart
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FiShoppingBag size={64} className="text-gray-700 mb-6" />
          <h2 className="text-xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Add some products to get started</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Browse Products <FiArrowRight />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.product._id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex gap-5"
              >
                {/* Image */}
                <Link to={`/products/${item.product._id}`} className="shrink-0">
                  <img
                    src={item.product.images[0]?.url}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-xl bg-gray-800"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.product._id}`}
                    className="text-white font-semibold hover:text-orange-400 transition-colors line-clamp-2 text-sm"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-orange-400 font-bold mt-1">
                    {formatPrice(item.price)}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiMinus size={13} />
                      </button>
                      <span className="w-10 text-center text-white font-semibold text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiPlus size={13} />
                      </button>
                    </div>

                    {/* Line Total + Remove */}
                    <div className="flex items-center gap-4">
                      <span className="text-white font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => handleRemove(item.product._id, item.product.name)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                        title="Remove item"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24">
              <h2 className="text-white font-bold text-lg mb-6">Order Summary</h2>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPrice(cart.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className={shippingPrice === 0 ? 'text-green-400' : 'text-white'}>
                    {shippingPrice === 0 ? 'FREE' : formatPrice(shippingPrice)}
                  </span>
                </div>
                {shippingPrice > 0 && (
                  <p className="text-xs text-gray-500">
                    Add {formatPrice(5000 - cart.totalPrice)} more for free shipping
                  </p>
                )}
                <div className="border-t border-gray-700 pt-3 flex justify-between font-bold text-white text-base">
                  <span>Total</span>
                  <span className="text-orange-400">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout <FiArrowRight />
              </button>

              <Link
                to="/products"
                className="block text-center text-gray-400 hover:text-white text-sm mt-4 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;