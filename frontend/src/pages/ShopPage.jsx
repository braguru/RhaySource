import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSliders, FiX } from 'react-icons/fi';
import ProductCard from '../components/features/ProductCard';
import productsData from '../data/products.json';
import './ShopPage.css';

const CATEGORIES = ['All', 'Serums', 'Moisturizers', 'Cleansers', 'Eye Care', 'Toners', 'Masks', 'Sunscreen', 'Body Care', 'Sets'];
const SKIN_TYPES = ['All', 'Dry', 'Oily', 'Sensitive', 'Normal', 'Combination'];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
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

  const { products } = productsData;

  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    CATEGORIES.forEach(cat => {
      if (cat === 'All') return;
      counts[cat] = products.filter(p => p.category === cat).length;
    });
    return counts;
  }, [products]);

  const skinTypeCounts = useMemo(() => {
    const counts = { All: products.length };
    SKIN_TYPES.forEach(type => {
      if (type === 'All') return;
      counts[type] = products.filter(p => p.skinType.includes(type)).length;
    });
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const categoryMatch = activeCategory === 'All' || p.category === activeCategory;
      const concernMatch = activeConcern === 'All' || p.skinType.includes(activeConcern);
      return categoryMatch && concernMatch;
    });
  }, [products, activeCategory, activeConcern]);

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
    <>
      <div className="filter-group">
        <h3 className="filter-label">Category</h3>
        <div className="filter-options">
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
        </div>
      </div>

      <div className="filter-group">
        <h3 className="filter-label">Target Skin Type</h3>
        <div className="filter-options">
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
        </div>
      </div>
    </>
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
          {filtered.length === 0 ? (
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
                {filtered.map(product => (
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
