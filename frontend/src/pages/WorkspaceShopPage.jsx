import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiHardDrive, FiMonitor, FiCpu as FiRam, FiSliders, FiX, FiSearch } from 'react-icons/fi';
import ProductCard from '../components/features/ProductCard';
import ProductCardSkeleton from '../components/features/skeletons/ProductCardSkeleton';
import { useProducts } from '../hooks/useProducts';
import { useTechCart } from '../context/TechCartContext';
import './WorkspacePage.css';
import './WorkspaceShopPage.css';
import './ShopPage.css';

const TechCard = ({ product }) => {
  const { addToTechCart } = useTechCart();

  return (
    <Link to={`/workspace/products/${product.id}`} className="tech-card-link">
      <motion.div
        className="tech-card"
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <div className="tech-card-image">
          <img 
            src={product.image_url || product.images?.primary || 'https://res.cloudinary.com/duhvgnorw/image/upload/v1776510657/rhaysource/placeholders/product-placeholder.jpg'} 
            alt={product.name} 
            onError={(e) => { e.target.src = 'https://res.cloudinary.com/duhvgnorw/image/upload/v1776510657/rhaysource/placeholders/product-placeholder.jpg'; }}
          />
          <div className="tech-badge">{product.category}</div>
        </div>

        <div className="tech-card-body">
          <div className="tech-card-header">
            <div>
              <p className="tech-brand">{product.brand}</p>
              <h3 className="tech-name">{product.name}</h3>
            </div>
            <p className="tech-price">GH₵{product.price.toLocaleString()}</p>
          </div>

          <p className="tech-description">{product.description}</p>

          <div className="tech-specs-grid">
            <div className="spec-item">
              <FiCpu /> <span>{product.specs.cpu}</span>
            </div>
            <div className="spec-item">
              <FiRam /> <span>{product.specs.ram}</span>
            </div>
            <div className="spec-item">
              <FiHardDrive /> <span>{product.specs.storage}</span>
            </div>
            <div className="spec-item">
              <FiMonitor /> <span>{product.specs.display}</span>
            </div>
          </div>

          <button
            className="tech-add-btn"
            onClick={(e) => { e.preventDefault(); addToTechCart(product); }}
          >
            Equip Workspace
          </button>
        </div>
      </motion.div>
    </Link>
  );
};

export default function WorkspaceShopPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeBrand, setActiveBrand] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { products, store, loading } = useProducts('workspace');

  // Maintenance Mode Protection
  const isMaintenance = store && store.is_active === false;

  // Lock scroll when filter drawer is open
  useEffect(() => {
    const html = document.documentElement;
    if (isFilterOpen) {
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
  }, [isFilterOpen]);

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);
  const brands = useMemo(() => ['All', ...new Set(products.map(p => p.brand))], [products]);

  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    categories.forEach(cat => {
      if (cat === 'All') return;
      counts[cat] = products.filter(p => p.category === cat).length;
    });
    return counts;
  }, [products, categories]);

  const brandCounts = useMemo(() => {
    const counts = { All: products.length };
    brands.forEach(brand => {
      if (brand === 'All') return;
      counts[brand] = products.filter(p => p.brand === brand).length;
    });
    return counts;
  }, [products, brands]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      const matchBrand = activeBrand === 'All' || p.brand === activeBrand;
      return matchCat && matchBrand;
    });
  }, [activeCategory, activeBrand, products]);

  // Best Sellers: ALL featured items matching current filters
  const bestSellers = useMemo(() => {
    return filteredProducts.filter(p => p.is_featured);
  }, [filteredProducts]);

  // Main grid: deduplicated — excludes products already shown in Best Sellers
  const bestSellerIds = useMemo(() => new Set(bestSellers.map(p => p.id)), [bestSellers]);
  const mainProducts = useMemo(() => filteredProducts.filter(p => !bestSellerIds.has(p.id)), [filteredProducts, bestSellerIds]);

  const FilterContent = () => (
    <>
      <div className="tech-filter-group">
        <h3 className="tech-filter-label">Categories</h3>
        <div className="tech-filter-options">
          {categories.map(cat => (
            <button
              key={cat}
              className={`tech-filter-link ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span className="filter-text">
                {typeof cat === 'object' ? (cat?.name || 'Workspace') : cat}
              </span>
              <span className="filter-count">[{categoryCounts[cat] || 0}]</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tech-filter-group">
        <h3 className="tech-filter-label">Brand</h3>
        <div className="tech-filter-options">
          {brands.map(brand => (
            <button
              key={brand}
              className={`tech-filter-link ${activeBrand === brand ? 'active' : ''}`}
              onClick={() => setActiveBrand(brand)}
            >
              <span className="filter-text">{brand}</span>
              <span className="filter-count">[{brandCounts[brand] || 0}]</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  if (isMaintenance) {
    return (
      <div className="workspace-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0b0c' }}>
        <div className="container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="workspace-eyebrow" style={{ color: '#38bdf8' }}>Access Refused</p>
            <h1 className="workspace-title">Workspace <span>Offline</span></h1>
            <p className="workspace-subtitle" style={{ maxWidth: '600px', margin: '1.5rem auto' }}>
              The Professional Workspace shop is currently offline for catalog synchronization. Please check back later.
            </p>
            <Link to="/" className="ws-primary-btn" style={{ marginTop: '2rem' }}>Return to Hub</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      {/* Tech Shop Header */}
      <section className="workspace-hero workspace-shop-hero">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="workspace-eyebrow">Professional Ecosystem</p>
            <h1 className="workspace-title">The Master <span>Collection</span></h1>
            <p className="workspace-subtitle">
              Curated precision hardware for the high-end professional.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="container workspace-body">
        {/* Desktop Sidebar */}
        <aside className="workspace-sidebar desktop-only">
          <FilterContent />
        </aside>

        <main className="workspace-main">
          {/* Mobile Filter Trigger */}
          <div className="tech-mobile-controls container mobile-only">
            <button 
              className="tech-mobile-filter-btn"
              onClick={() => setIsFilterOpen(true)}
            >
              <FiSliders />
              <span>Technical Filters</span>
            </button>
          </div>

          {/* Best Sellers Section — sits OUTSIDE the product grid */}
          {!loading && bestSellers.length > 0 && (
            <div className="shop-best-sellers tech-best-sellers">
              <div className="best-sellers-header">
                <h2 className="best-sellers-title">Best Sellers</h2>
                <p className="best-sellers-subtitle">
                  {activeCategory !== 'All' ? `Top picks in ${activeCategory}` : 'Most trusted tools in our arsenal'}
                </p>
              </div>
              <div className="best-sellers-grid">
                {bestSellers.map(product => (
                  <div key={product.id} className="best-seller-item">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <hr className="best-sellers-divider tech-divider" />
            </div>
          )}

          <motion.div layout className="tech-product-grid">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="workspace-shop-grid">
                  {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              ) : mainProducts.length > 0 ? (
                mainProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : bestSellers.length === 0 ? (
                <motion.div 
                  className="no-tech-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key="no-results"
                >
                  <div className="no-results-content">
                    <FiSearch />
                    <h3>No matching workstations found</h3>
                    <p>Try adjusting your brand or category filters to find the perfect setup.</p>
                    <button onClick={() => { setActiveCategory('All'); setActiveBrand('All'); }} className="reset-filters-btn">
                      Reset All Filters
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </main>

      </div>

      {/* Mobile Tech Filter Drawer Expansion */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              className="tech-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div 
              className="tech-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="drawer-header">
                <h3>Technical Specifications</h3>
                <button onClick={() => setIsFilterOpen(false)}><FiX /></button>
              </div>
              <div className="drawer-body">
                <FilterContent />
              </div>
              <div className="drawer-footer">
                <button 
                  className="apply-filters-btn"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Show {filteredProducts.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
