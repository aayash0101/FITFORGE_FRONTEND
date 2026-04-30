import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { formatPrice } from '../utils/formatPrice.js';
import Loader from '../components/ui/Loader.jsx';
import toast from 'react-hot-toast';
import { FiMapPin, FiPackage, FiArrowLeft } from 'react-icons/fi';

const STATUS_STYLES = {
  processing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  confirmed:  'bg-blue-500/10  text-blue-400  border-blue-500/30',
  shipped:    'bg-purple-500/10 text-purple-400 border-purple-500/30',
  delivered:  'bg-green-500/10 text-green-400  border-green-500/30',
  cancelled:  'bg-red-500/10   text-red-400    border-red-500/30',
};

const STEPS = ['processing', 'confirmed', 'shipped', 'delivered'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch {
        toast.error('Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      const { data } = await api.put(`/orders/${id}/cancel`, {
        reason: 'Cancelled by user',
      });
      setOrder(data.order);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loader />;
  if (!order) return null;

  const isCancelled = order.orderStatus === 'cancelled';
  const canCancel = ['processing', 'confirmed'].includes(order.orderStatus);
  const currentStep = STEPS.indexOf(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-3 transition-colors"
          >
            <FiArrowLeft size={15} /> Back to Orders
          </Link>
          <h1 className="text-2xl font-black text-white">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-NP', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold px-3 py-1.5 rounded-full border capitalize ${STATUS_STYLES[order.orderStatus]}`}>
            {order.orderStatus}
          </span>
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-red-400 hover:text-red-300 text-sm border border-red-500/30 hover:border-red-400/50 px-4 py-1.5 rounded-full transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      {!isCancelled && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-6 text-sm uppercase tracking-wide">
            Order Progress
          </h2>
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-700 z-0" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-orange-500 z-0 transition-all duration-500"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />

            {STEPS.map((s, idx) => {
              const isDone = idx <= currentStep;
              return (
                <div key={s} className="flex flex-col items-center z-10 gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    isDone
                      ? 'bg-orange-500 border-orange-500 text-white'
                      : 'bg-gray-900 border-gray-600 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-xs capitalize font-medium ${isDone ? 'text-orange-400' : 'text-gray-500'}`}>
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Items + Address */}
        <div className="lg:col-span-2 space-y-6">

          {/* Order Items */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-5 flex items-center gap-2">
              <FiPackage className="text-orange-400" /> Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl bg-gray-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm line-clamp-2">{item.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-white font-semibold text-sm shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4 flex items-center gap-2">
              <FiMapPin className="text-orange-400" /> Shipping Address
            </h2>
            <div className="text-gray-400 text-sm space-y-1">
              <p className="text-white font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
              {order.shippingAddress.postalCode && (
                <p>Postal Code: {order.shippingAddress.postalCode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24">
            <h2 className="text-white font-bold mb-5">Payment</h2>

            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-gray-400">
                <span>Method</span>
                <span className="text-white capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Status</span>
                <span className={order.isPaid ? 'text-green-400' : 'text-yellow-400'}>
                  {order.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">{formatPrice(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className={order.shippingPrice === 0 ? 'text-green-400' : 'text-white'}>
                  {order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}
                </span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between font-bold text-white text-base">
                <span>Total</span>
                <span className="text-orange-400">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;