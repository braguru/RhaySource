import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSliders, FiX, FiSearch } from 'react-icons/fi';
import ProductCard from '../components/features/ProductCard';
import ProductCardSkeleton from '../components/features/skeletons/ProductCardSkeleton';
import { useProducts } from '../hooks/useProducts';
import { useHomeLivingCart } from '../context/HomeLivingCartContext';
import './HomeLivingPage.css';
import './HomeLivingShopPage.css';
import './ShopPage.css';


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
          <img 
            src={product.image_url || product.images?.primary || 'https://res.cloudinary.com/duhvgnorw/image/upload/v1776510657/rhaysource/placeholders/product-placeholder.jpg'} 
            alt={product.name} 
            onError={(e) => { e.target.src = 'https://res.cloudinary.com/duhvgnorw/image/upload/v1776510657/rhaysource/placeholders/product-placeholder.jpg'; }}
          />
          <span className="hl-card-badge">
            {typeof product.category === 'object' ? (product.category?.name || 'Home & Living') : (product.category || 'Home & Living')}
          </span>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, store, loading } = useProducts('home-living');
  const initialCategory = searchParams.get('category') || 'All';

  // Maintenance Mode Protection
  const isMaintenance = store && store.is_active === false;

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
    else setActiveCategory('All');
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

  // Best Sellers: ALL featured items matching current category filter
  const bestSellers = useMemo(() => {
    return filtered.filter(p => p.is_featured);
  }, [filtered]);

  // Main grid: deduplicated — excludes products already shown in Best Sellers
  const bestSellerIds = useMemo(() => new Set(bestSellers.map(p => p.id)), [bestSellers]);
  const mainProducts = useMemo(() => filtered.filter(p => !bestSellerIds.has(p.id)), [filtered, bestSellerIds]);

  const FilterContent = () => (
    <div className="hl-filter-group">
      <h3 className="hl-filter-label">Category</h3>
      <div className="hl-filter-options">
        {categories.map(cat => (
          <button
            key={cat}
            className={`hl-filter-link ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => { 
              setActiveCategory(cat); 
              setIsFilterOpen(false);
              if (cat === 'All') setSearchParams({});
              else setSearchParams({ category: cat });
            }}
          >
            <span>{typeof cat === 'object' ? (cat?.name || 'Category') : cat}</span>
            <span className="hl-filter-count">[{categoryCounts[cat] || 0}]</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (isMaintenance) {
    return (
      <div className="hl-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="hl-eyebrow" style={{ color: 'var(--studio-accent)' }}>Access Refused</p>
            <h1 className="hl-hero-title">Collection <span>Offline</span></h1>
            <p className="hl-hero-subtitle" style={{ maxWidth: '600px', margin: '1.5rem auto' }}>
              The Home & Living shop is currently undergoing catalog synchronization. Please check back later.
            </p>
            <Link to="/" className="hl-hero-btn" style={{ marginTop: '2rem' }}>Return to Hub</Link>
          </motion.div>
        </div>
      </div>
    );
  }

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

      {/* Mobile Filter Trigger — outside flex body for reliable sticky positioning */}
      <div className="hl-mobile-controls hl-mobile-only">
        <button className="hl-mobile-filter-btn" onClick={() => setIsFilterOpen(true)}>
          <FiSliders />
          <span>Filter by Category</span>
        </button>
      </div>

      {/* Body */}
      <div className="container hl-shop-body">

        {/* Desktop Sidebar */}
        <aside className="hl-sidebar hl-desktop-only">
          <FilterContent />
        </aside>

        <main className="hl-shop-main">
          {loading ? (
            <div className="hl-product-grid">
              {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <>
              {/* Best Sellers Section */}
              {bestSellers.length > 0 && (
                <div className="shop-best-sellers hl-best-sellers">
                  <div className="best-sellers-header">
                    <h2 className="best-sellers-title">Best Sellers</h2>
                    <p className="best-sellers-subtitle">
                      {activeCategory !== 'All' ? `Top picks in ${activeCategory}` : 'Handpicked — loved by our community'}
                    </p>
                  </div>
                  <div className="best-sellers-grid">
                    {bestSellers.map(p => (
                      <div key={p.id} className="best-seller-item">
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                  <hr className="best-sellers-divider" />
                </div>
              )}

              {mainProducts.length === 0 && bestSellers.length === 0 ? (
                <motion.div className="hl-no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="no-results">
                  <FiSearch />
                  <h3>No products found</h3>
                  <p>Try a different category.</p>
                  <button onClick={() => { setActiveCategory('All'); setSearchParams({}); }} className="hl-reset-btn">Show All</button>
                </motion.div>
              ) : (
                <motion.div layout className="hl-product-grid">
                  <AnimatePresence mode="popLayout">
                    {mainProducts.map((p) => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ProductCard product={p} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}
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
