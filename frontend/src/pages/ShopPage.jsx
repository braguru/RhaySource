import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSliders, FiX, FiSearch, FiChevronDown } from 'react-icons/fi';
import ProductCard from '../components/features/ProductCard';
import ProductCardSkeleton from '../components/features/skeletons/ProductCardSkeleton';
import { useProducts } from '../hooks/useProducts';
import './ShopPage.css';

const FilterGroup = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="filter-group">
      <button 
        className="filter-group-header" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="filter-label">{title}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <FiChevronDown />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="filter-group-content"
          >
            <div className="filter-options">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scroll Lock Logic
  useEffect(() => {
    const html = document.documentElement;
    if (isFilterDrawerOpen) {
      document.body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      html.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      html.style.overflow = 'unset';
    };
  }, [isFilterDrawerOpen]);
  
  const activeCategory = searchParams.get('category') || 'All';
  const activeConcern = searchParams.get('concern') || 'All';
  const activeBrand = searchParams.get('brand') || 'All';

  const { products, loading } = useProducts('skincare');

  // Dynamic Metadata Discovery
  const CATEGORIES = useMemo(() => {
    const c = new Set(products.map(p => p.category).filter(cat => cat && cat !== 'All'));
    return ['All', ...Array.from(c).sort()];
  }, [products]);

  const BRANDS = useMemo(() => {
    const b = new Set(products.map(p => p.brand).filter(brand => brand && brand !== 'All'));
    return ['All', ...Array.from(b).sort()];
  }, [products]);

  const SKIN_TYPES = useMemo(() => {
    const types = new Set();
    products.forEach(p => {
      p.specs?.skinType?.forEach(t => {
        if (t && t !== 'All') types.add(t);
      });
    });
    return ['All', ...Array.from(types).sort()];
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    CATEGORIES.forEach(cat => {
      if (cat === 'All') return;
      counts[cat] = products.filter(p => p.category === cat).length;
    });
    return counts;
  }, [products, CATEGORIES]);

  const brandCounts = useMemo(() => {
    const counts = { All: products.length };
    BRANDS.forEach(brand => {
      if (brand === 'All') return;
      counts[brand] = products.filter(p => p.brand === brand).length;
    });
    return counts;
  }, [products, BRANDS]);

  const skinTypeCounts = useMemo(() => {
    const counts = { All: products.length };
    SKIN_TYPES.forEach(type => {
      if (type === 'All') return;
      counts[type] = products.filter(p => p.specs?.skinType?.includes(type)).length;
    });
    return counts;
  }, [products, SKIN_TYPES]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const categoryMatch = activeCategory === 'All' || p.category === activeCategory;
      const concernMatch = activeConcern === 'All' || p.specs?.skinType?.includes(activeConcern);
      const brandMatch = activeBrand === 'All' || p.brand === activeBrand;
      const searchMatch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase());

      return categoryMatch && concernMatch && brandMatch && searchMatch;
    });
  }, [products, activeCategory, activeConcern, activeBrand, searchQuery]);

  // Best Sellers
  const bestSellers = useMemo(() => {
    return filtered.filter(p => p.is_featured);
  }, [filtered]);

  const bestSellerIds = useMemo(() => new Set(bestSellers.map(p => p.id)), [bestSellers]);
  const mainProducts = useMemo(() => filtered.filter(p => !bestSellerIds.has(p.id)), [filtered, bestSellerIds]);

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value === 'All') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  }

  const FilterContent = () => (
    <div className="filter-container">
      <FilterGroup title="Category">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-link ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setFilter('category', cat)}
          >
            <span className="filter-text">{cat}</span>
            <span className="filter-count">({categoryCounts[cat] || 0})</span>
          </button>
        ))}
      </FilterGroup>

      <FilterGroup title="Shop by Brand" defaultOpen={false}>
        <div className="scrollable-filters">
          {BRANDS.map(brand => (
            <button
              key={brand}
              className={`filter-link ${activeBrand === brand ? 'active' : ''}`}
              onClick={() => setFilter('brand', brand)}
            >
              <span className="filter-text">{brand}</span>
              <span className="filter-count">({brandCounts[brand] || 0})</span>
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Target Skin Type">
        {SKIN_TYPES.map(type => (
          <button
            key={type}
            className={`filter-link ${activeConcern === type ? 'active' : ''}`}
            onClick={() => setFilter('concern', type)}
          >
            <span className="filter-text">{type}</span>
            <span className="filter-count">({skinTypeCounts[type] || 0})</span>
          </button>
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="container">
          <h1 className="shop-title">All Products</h1>
          <p className="shop-subtitle">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'} curated for your ritual
          </p>
        </div>
      </div>

      <div className="container shop-body">
        {/* Desktop Sidebar */}
        <aside className="shop-filters desktop-only">
          <div className="search-container">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="shop-search-input"
                placeholder="Search products or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <FilterContent />
        </aside>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isFilterDrawerOpen && (
            <>
              <motion.div 
                className="filter-drawer-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterDrawerOpen(false)}
              />
              <motion.aside 
                className="filter-drawer"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <div className="drawer-header">
                  <h3>Filters</h3>
                  <button className="close-drawer" onClick={() => setIsFilterDrawerOpen(false)}>
                    <FiX />
                  </button>
                </div>
                
                <div className="drawer-body">
                  <div className="search-container" style={{ marginBottom: '2rem' }}>
                    <div className="search-input-wrapper">
                      <FiSearch className="search-icon" />
                      <input
                        type="text"
                        className="shop-search-input"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: '#f8f8f8' }}
                      />
                    </div>
                  </div>
                  <FilterContent />
                </div>

                <div className="drawer-footer">
                  <button 
                    className="btn-primary w-full"
                    onClick={() => setIsFilterDrawerOpen(false)}
                  >
                    Show {filtered.length} Results
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="shop-results">
          {/* Mobile Filter Trigger — inside main content col, matches workspace sticky pattern */}
          <div className="mobile-filter-bar">
            <button
              className="filter-toggle-btn"
              onClick={() => setIsFilterDrawerOpen(true)}
            >
              <FiSliders />
              <span>Filters & Sort</span>
            </button>
          </div>
          {/* Best Sellers Section */}
          {!loading && bestSellers.length > 0 && (
            <div className="shop-best-sellers">
              <div className="best-sellers-header">
                <h2 className="best-sellers-title">Best Sellers</h2>
                <p className="best-sellers-subtitle">
                  {activeCategory !== 'All' ? `Top picks in ${activeCategory}` : 'Most-loved products in this collection'}
                </p>
              </div>
              <div className="best-sellers-grid">
                {bestSellers.map(product => (
                  <div key={product.id} className="best-seller-item">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <hr className="best-sellers-divider" />
            </div>
          )}

          {loading ? (
            <div className="product-grid">
              {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : mainProducts.length === 0 && bestSellers.length === 0 ? (
            <motion.div 
              className="shop-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>No products match the selected filters.</p>
              <button
                className="btn-outline rounded-btn"
                onClick={() => setSearchParams({})}
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <motion.div 
              className="product-grid"
              layout
            >
              <AnimatePresence>
                {mainProducts.map(product => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>

      </div>
    </div>
  );
}
