// Add import
import OrderDetailPage from './OrderDetailPage.jsx';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { formatPrice } from '../utils/formatPrice.js';
import Loader from '../components/ui/Loader.jsx';
import { FiPackage, FiChevronRight } from 'react-icons/fi';

const STATUS_STYLES = {
  processing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  confirmed:  'bg-blue-500/10  text-blue-400  border-blue-500/30',
  shipped:    'bg-purple-500/10 text-purple-400 border-purple-500/30',
  delivered:  'bg-green-500/10 text-green-400  border-green-500/30',
  cancelled:  'bg-red-500/10   text-red-400    border-red-500/30',
};

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-white mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FiPackage size={64} className="text-gray-700 mb-6" />
          <h2 className="text-xl font-bold text-white mb-2">No orders yet</h2>
          <p className="text-gray-400 mb-8">When you place an order it will appear here</p>
          <Link
            to="/products"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block bg-gray-900 border border-gray-800 hover:border-orange-500/50 rounded-2xl p-5 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Order ID + Date */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="text-white font-mono text-sm font-semibold">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_STYLES[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-NP', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Items Preview */}
                  <div className="flex items-center gap-2 mb-3">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <img
                        key={idx}
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg bg-gray-800"
                      />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 text-xs font-semibold">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-400 text-sm">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>

                {/* Total + Arrow */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-white font-bold">{formatPrice(order.totalPrice)}</p>
                    <p className="text-gray-500 text-xs capitalize">{order.paymentMethod}</p>
                  </div>
                  <FiChevronRight
                    size={18}
                    className="text-gray-600 group-hover:text-orange-400 transition-colors"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;