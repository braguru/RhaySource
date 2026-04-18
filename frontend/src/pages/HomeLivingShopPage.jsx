import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSliders, FiX, FiSearch } from 'react-icons/fi';
import homeProducts from '../data/home-products.json';
import { useHomeLivingCart } from '../context/HomeLivingCartContext';
import './HomeLivingPage.css';
import './HomeLivingShopPage.css';

const HomeCard = ({ product, index }) => {
  const { addToHomeCart } = useHomeLivingCart();
  return (
    <Link to={`/home-living/products/${product.id}`} className="hl-card-link">
      <motion.div
        className="hl-card"
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="hl-card-image">
          <img src={product.images.primary} alt={product.name} />
          <span className="hl-card-badge">{product.category}</span>
        </div>
        <div className="hl-card-body">
          <p className="hl-card-brand">{product.brand}</p>
          <h3 className="hl-card-name">{product.name}</h3>
          <p className="hl-card-desc">{product.description}</p>
          <div className="hl-card-footer">
            <span className="hl-card-price">GH₵{product.price.toLocaleString()}</span>
            <button
              className="hl-card-add"
              onClick={(e) => { e.preventDefault(); addToHomeCart(product); }}
            >
              Add to Bag
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default function HomeLivingShopPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { products } = homeProducts;

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isFilterOpen]);

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);

  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    categories.forEach(c => { if (c !== 'All') counts[c] = products.filter(p => p.category === c).length; });
    return counts;
  }, [products, categories]);

  const filtered = useMemo(() =>
    products.filter(p => activeCategory === 'All' || p.category === activeCategory),
    [products, activeCategory]
  );

  const FilterContent = () => (
    <div className="hl-filter-group">
      <h3 className="hl-filter-label">Category</h3>
      <div className="hl-filter-options">
        {categories.map(cat => (
          <button
            key={cat}
            className={`hl-filter-link ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => { setActiveCategory(cat); setIsFilterOpen(false); }}
          >
            <span>{cat}</span>
            <span className="hl-filter-count">[{categoryCounts[cat] || 0}]</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="hl-page">

      {/* Hero */}
      <section className="hl-shop-hero">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="hl-eyebrow">Home & Living</p>
            <h1 className="hl-hero-title">The Full <span>Collection</span></h1>
            <p className="hl-hero-subtitle">Premium products for every corner of your home.</p>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <div className="container hl-shop-body">

        {/* Desktop Sidebar */}
        <aside className="hl-sidebar hl-desktop-only">
          <FilterContent />
        </aside>

        <main className="hl-shop-main">
          {/* Mobile Filter Trigger */}
          <div className="hl-mobile-controls hl-mobile-only">
            <button className="hl-mobile-filter-btn" onClick={() => setIsFilterOpen(true)}>
              <FiSliders />
              <span>Filter by Category</span>
            </button>
          </div>

          <motion.div layout className="hl-product-grid">
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                filtered.map((p, i) => <HomeCard key={p.id} product={p} index={i} />)
              ) : (
                <motion.div className="hl-no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="no-results">
                  <FiSearch />
                  <h3>No products found</h3>
                  <p>Try a different category.</p>
                  <button onClick={() => setActiveCategory('All')} className="hl-reset-btn">Show All</button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              className="hl-drawer-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              className="hl-drawer"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="hl-drawer-header">
                <h3>Filter</h3>
                <button onClick={() => setIsFilterOpen(false)}><FiX /></button>
              </div>
              <div className="hl-drawer-body">
                <FilterContent />
              </div>
              <div className="hl-drawer-footer">
                <button className="hl-apply-btn" onClick={() => setIsFilterOpen(false)}>
                  Show {filtered.length} Products
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
