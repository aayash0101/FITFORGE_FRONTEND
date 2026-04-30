import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiZap, FiShield, FiTruck } from 'react-icons/fi';
import api from '../api/axios.js';
import ProductCard from '../components/product/ProductCard.jsx';
import Loader from '../components/ui/Loader.jsx';

// ─── Data ──────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'Protein', value: 'protein', emoji: '💪' },
  { label: 'Creatine', value: 'creatine', emoji: '⚡' },
  { label: 'Equipment', value: 'equipment', emoji: '🏋️' },
  { label: 'Apparel', value: 'apparel', emoji: '👕' },
  { label: 'Vitamins', value: 'vitamins', emoji: '💊' },
  { label: 'Accessories', value: 'accessories', emoji: '🎒' },
];

const PERKS = [
  { icon: <FiTruck size={22} />, title: 'Free Delivery', desc: 'On orders over Rs. 5,000' },
  { icon: <FiShield size={22} />, title: '100% Authentic', desc: 'Genuine products guaranteed' },
  { icon: <FiZap size={22} />, title: 'Fast Dispatch', desc: 'Same day for Kathmandu' },
];


const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products/featured');
        setFeatured(data.products);
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-black overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 text-center">
          <span className="inline-block bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            Nepal's #1 Fitness Store
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            Forge Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              Best Body
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Premium gym supplements, equipment, and apparel - delivered across Nepal.
            Train harder. Recover faster. Look better.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Shop Now <FiArrowRight />
            </Link>
            <Link
              to="/products?category=protein"
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg border border-gray-700"
            >
              Browse Supplements
            </Link>
          </div>
        </div>
      </section>

      {/* ── Perks Bar ──────────────────────────────────────────── */}
      <section className="bg-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PERKS.map((perk) => (
            <div key={perk.title} className="flex items-center gap-3 justify-center sm:justify-start">
              <span className="text-orange-400">{perk.icon}</span>
              <div>
                <p className="text-white font-semibold text-sm">{perk.title}</p>
                <p className="text-gray-400 text-xs">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-white mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              to={`/products?category=${cat.value}`}
              className="bg-gray-900 border border-gray-800 hover:border-orange-500/50 rounded-xl p-4 text-center transition-all hover:shadow-lg hover:shadow-orange-500/10 group"
            >
              <div className="text-3xl mb-2">{cat.emoji}</div>
              <p className="text-sm font-medium text-gray-300 group-hover:text-orange-400 transition-colors">
                {cat.label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Featured Products</h2>
          <Link
            to="/products"
            className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            View All <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <Loader />
        ) : featured.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;