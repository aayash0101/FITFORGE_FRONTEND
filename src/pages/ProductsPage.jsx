import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios.js';
import ProductCard from '../components/product/ProductCard.jsx';
import Loader from '../components/ui/Loader.jsx';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import useDebounce from '../hooks/useDebounce.js';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Protein', value: 'protein' },
  { label: 'Creatine', value: 'creatine' },
  { label: 'Vitamins', value: 'vitamins' },
  { label: 'Equipment', value: 'equipment' },
  { label: 'Apparel', value: 'apparel' },
  { label: 'Accessories', value: 'accessories' },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Top Rated', value: 'rating' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Filters
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedKeyword = useDebounce(keyword, 400);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedKeyword) params.set('keyword', debouncedKeyword);
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);
      params.set('page', page);
      params.set('limit', 12);

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, category, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync category from URL (e.g. clicking homepage category cards)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
  }, []);

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);
  };

  const clearFilters = () => {
    setKeyword('');
    setCategory('');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = keyword || category || sort !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">All Products</h1>
          {!loading && (
            <p className="text-gray-400 text-sm mt-1">{total} products found</p>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors sm:hidden"
        >
          <FiFilter size={15} /> Filters
        </button>
      </div>

      {/* ── Search + Sort ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
          />
          {keyword && (
            <button
              onClick={() => setKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:border-orange-500 transition cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* ── Category Pills ── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryChange(cat.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat.value
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-1.5 rounded-full text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors flex items-center gap-1"
          >
            <FiX size={13} /> Clear All
          </button>
        )}
      </div>

      {/* ── Products Grid ── */}
      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No products found.</p>
          <button
            onClick={clearFilters}
            className="mt-4 text-orange-400 hover:text-orange-300 text-sm"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Previous
          </button>

          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                page === p
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, pages))}
            disabled={page === pages}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;