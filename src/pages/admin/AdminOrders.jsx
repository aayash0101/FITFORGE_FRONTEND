import { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import { formatPrice } from '../../utils/formatPrice.js';
import Loader from '../../components/ui/Loader.jsx';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  processing: 'bg-yellow-500/10 text-yellow-400',
  confirmed:  'bg-blue-500/10  text-blue-400',
  shipped:    'bg-purple-500/10 text-purple-400',
  delivered:  'bg-green-500/10 text-green-400',
  cancelled:  'bg-red-500/10   text-red-400',
};

const ORDER_STATUSES = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders?limit=50');
      setOrders(data.orders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, orderStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-white mb-8">Orders</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-left">
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Payment</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-300 text-xs">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{order.user?.name}</p>
                    <p className="text-gray-500 text-xs">{order.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{order.items.length}</td>
                  <td className="px-6 py-4 text-white font-semibold">
                    {formatPrice(order.totalPrice)}
                  </td>
                  <td className="px-6 py-4 text-gray-300 capitalize">{order.paymentMethod}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.orderStatus}
                      disabled={updatingId === order._id || order.orderStatus === 'cancelled'}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed ${STATUS_STYLES[order.orderStatus]}`}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-gray-800 text-white capitalize">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-NP', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;