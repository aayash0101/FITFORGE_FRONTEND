import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import {
  FiMapPin, FiPhone, FiUser, FiChevronRight,
  FiShoppingBag, FiCheck,
} from 'react-icons/fi';

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery', emoji: '💵' },
  { value: 'esewa', label: 'eSewa', emoji: '🟢' },
  { value: 'khalti', label: 'Khalti', emoji: '🟣' },
];

const PROVINCES = [
  'Koshi', 'Madhesh', 'Bagmati', 'Gandaki',
  'Lumbini', 'Karnali', 'Sudurpashchim',
];

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    province: 'Bagmati',
    postalCode: '',
  });

  const shippingPrice = cart?.totalPrice >= 5000 ? 0 : 150;
  const grandTotal = (cart?.totalPrice || 0) + shippingPrice;

  const handleAddressChange = (e) =>
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateAddress = () => {
    const required = ['fullName', 'phone', 'address', 'city', 'province'];
    for (const field of required) {
      if (!address[field].trim()) {
        toast.error(`Please fill in your ${field}`);
        return false;
      }
    }
    if (address.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        shippingAddress: address,
        paymentMethod,
      });
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <FiShoppingBag size={60} className="text-gray-700 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
        <Link
          to="/products"
          className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-white mb-8">Checkout</h1>

      {/* ── Step Indicator ── */}
      <div className="flex items-center gap-2 mb-10">
        {['Shipping', 'Payment', 'Review'].map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isDone = step > stepNum;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                isActive ? 'bg-orange-500 text-white' :
                isDone ? 'bg-green-500/20 text-green-400' :
                'bg-gray-800 text-gray-500'
              }`}>
                {isDone ? <FiCheck size={14} /> : <span>{stepNum}</span>}
                {label}
              </div>
              {idx < 2 && <FiChevronRight size={16} className="text-gray-600" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: Steps ── */}
        <div className="lg:col-span-2">

          {/* Step 1 — Shipping Address */}
          {step === 1 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <FiMapPin className="text-orange-400" /> Shipping Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
                    <input
                      name="fullName"
                      value={address.fullName}
                      onChange={handleAddressChange}
                      placeholder="Aayash Shrestha"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
                    <input
                      name="phone"
                      value={address.phone}
                      onChange={handleAddressChange}
                      placeholder="98XXXXXXXX"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-400 mb-1.5">Street Address</label>
                  <input
                    name="address"
                    value={address.address}
                    onChange={handleAddressChange}
                    placeholder="Thamel, Ward No. 26"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">City</label>
                  <input
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    placeholder="Kathmandu"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Province</label>
                  <select
                    name="province"
                    value={address.province}
                    onChange={handleAddressChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition cursor-pointer"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Postal Code <span className="text-gray-600">(optional)</span>
                  </label>
                  <input
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleAddressChange}
                    placeholder="44600"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <button
                onClick={() => { if (validateAddress()) setStep(2); }}
                className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Continue to Payment <FiChevronRight />
              </button>
            </div>
          )}

          {/* Step 2 — Payment Method */}
          {step === 2 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-6">Payment Method</h2>

              <div className="space-y-3 mb-6">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === method.value
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="accent-orange-500"
                    />
                    <span className="text-2xl">{method.emoji}</span>
                    <span className="text-white font-medium">{method.label}</span>
                    {paymentMethod === method.value && (
                      <FiCheck size={16} className="text-orange-400 ml-auto" />
                    )}
                  </label>
                ))}
              </div>

              {paymentMethod !== 'cod' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ {paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'} integration coming soon.
                    Your order will be placed and payment collected on delivery.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Review Order <FiChevronRight />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Review Order */}
          {step === 3 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-6">Review Your Order</h2>

              {/* Shipping Summary */}
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-300 text-sm font-semibold">Shipping To</h3>
                  <button onClick={() => setStep(1)} className="text-orange-400 text-xs hover:underline">
                    Edit
                  </button>
                </div>
                <p className="text-white text-sm">{address.fullName}</p>
                <p className="text-gray-400 text-sm">{address.phone}</p>
                <p className="text-gray-400 text-sm">
                  {address.address}, {address.city}, {address.province}
                </p>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-800 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-300 text-sm font-semibold">Payment</h3>
                  <button onClick={() => setStep(2)} className="text-orange-400 text-xs hover:underline">
                    Edit
                  </button>
                </div>
                <p className="text-white text-sm capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</p>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={item.product._id} className="flex items-center gap-3">
                    <img
                      src={item.product.images[0]?.url}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-lg bg-gray-800"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  {loading ? 'Placing Order...' : `Place Order • ${formatPrice(grandTotal)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24">
            <h2 className="text-white font-bold mb-5">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.product._id} className="flex justify-between text-sm">
                  <span className="text-gray-400 line-clamp-1 flex-1 mr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="text-white shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-700 pt-4 space-y-2 text-sm">
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
              <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-gray-700">
                <span>Total</span>
                <span className="text-orange-400">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;