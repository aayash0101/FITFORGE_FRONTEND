import { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import { formatPrice } from '../../utils/formatPrice.js';
import Loader from '../../components/ui/Loader.jsx';
import {
  FiShoppingBag, FiPackage,
  FiUsers, FiDollarSign,
} from 'react-icons/fi';

const STATUS_STYLES = {
  processing: 'bg-yellow-500/10 text-yellow-400',
  confirmed:  'bg-blue-500/10  text-blue-400',
  shipped:    'bg-purple-500/10 text-purple-400',
  delivered:  'bg-green-500/10 text-green-400',
  cancelled:  'bg-red-500/10   text-red-400',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          api.get('/orders?limit=5'),
          api.get('/products?limit=1'),
          api.get('/admin/users?limit=1'),
        ]);

        const orders = ordersRes.data.orders;
        const revenue = orders.reduce((acc, o) =>
          o.orderStatus !== 'cancelled' ? acc + o.totalPrice : acc, 0
        );

        setStats({
          totalOrders: ordersRes.data.total,
          totalProducts: productsRes.data.total,
          totalUsers: usersRes.data.total,
          revenue,
        });

        setRecentOrders(orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  const STAT_CARDS = [
    {
      label: 'Total Revenue',
      value: formatPrice(stats?.revenue || 0),
      icon: <FiDollarSign size={22} />,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: <FiPackage size={22} />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: <FiShoppingBag size={22} />,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <FiUsers size={22} />,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-white mb-8">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">{card.label}</span>
              <span className={`${card.bg} ${card.color} p-2 rounded-xl`}>
                {card.icon}
              </span>
            </div>
            <p className="text-3xl font-black text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-white font-bold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-500 text-left">
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-300">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-gray-300">{order.user?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-white font-semibold">
                    {formatPrice(order.totalPrice)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
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

export default AdminDashboard;