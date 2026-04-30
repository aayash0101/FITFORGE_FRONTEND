import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import {
  FiGrid, FiPackage, FiShoppingBag,
  FiUsers, FiLogOut, FiArrowLeft,
} from 'react-icons/fi';

const NAV = [
  { to: '/admin',          label: 'Dashboard',  icon: <FiGrid />,       end: true },
  { to: '/admin/products', label: 'Products',   icon: <FiShoppingBag /> },
  { to: '/admin/orders',   label: 'Orders',     icon: <FiPackage />     },
  { to: '/admin/users',    label: 'Users',      icon: <FiUsers />       },
];

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-950">

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-800">
          <span className="text-xl font-black">
            Fit<span className="text-orange-400">Forge</span>
            <span className="ml-2 text-xs font-semibold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">
              ADMIN
            </span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-gray-800 space-y-1">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <FiArrowLeft /> Back to Store
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-gray-800 transition-colors"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;