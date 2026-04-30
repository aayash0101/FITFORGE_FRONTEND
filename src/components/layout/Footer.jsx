import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">

      <div>
        <h3 className="text-xl font-black mb-2">
          Fit<span className="text-orange-400">Forge</span>
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          Premium gym & fitness products delivered across Nepal.
        </p>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-3">Quick Links</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><Link to="/" className="hover:text-orange-400 transition-colors">Home</Link></li>
          <li><Link to="/products" className="hover:text-orange-400 transition-colors">Products</Link></li>
          <li><Link to="/cart" className="hover:text-orange-400 transition-colors">Cart</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-3">Account</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li><Link to="/login" className="hover:text-orange-400 transition-colors">Login</Link></li>
          <li><Link to="/register" className="hover:text-orange-400 transition-colors">Register</Link></li>
          <li><Link to="/orders" className="hover:text-orange-400 transition-colors">My Orders</Link></li>
        </ul>
      </div>
    </div>

    <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-500">
      © {new Date().getFullYear()} FitForge. Built with 🔥 in Nepal.
    </div>
  </footer>
);

export default Footer;