import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiHardDrive, FiMonitor, FiCpu as FiRam, FiSliders, FiX, FiSearch, FiZap, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { SiApple, SiDell, SiLenovo, SiHp, SiRazer, SiAsus, SiIntel, SiAmd } from 'react-icons/si';
import TechCard from '../components/features/TechCard';
import ProductCardSkeleton from '../components/features/skeletons/ProductCardSkeleton';
import { useProducts } from '../hooks/useProducts';
import { useTechCart } from '../context/TechCartContext';
import { supabase } from '../lib/supabase';
import './ShopPage.css';
import './WorkspacePage.css';
import './WorkspaceShopPage.css';

export default function WorkspaceShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';
  const activeBrand = searchParams.get('brand') || 'All';
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { products, store, loading } = useProducts('workspace');
  const [allStoreCategories, setAllStoreCategories] = useState([]);
  const [isBrandNavCollapsed, setIsBrandNavCollapsed] = useState(window.innerWidth < 768);

  // Fetch all taxonomy entries for placeholders
  useEffect(() => {
    async function fetchAllCategories() {
      if (!store?.id) return;
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .eq('store_id', store.id)
        .order('name');
      if (!error && data) {
        setAllStoreCategories(data.map(c => c.name));
      }
    }
    fetchAllCategories();
  }, [store?.id]);

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

  // Robust category and brand extraction (handles strings and objects)
  const categories = useMemo(() => {
    const raw = products.map(p => typeof p.category === 'object' ? p.category?.name : p.category);
    const combined = [...new Set([...raw.filter(Boolean), ...allStoreCategories])];
    
    // Sort alphabetically but keep 'All' at top
    return ['All', ...combined.sort((a, b) => a.localeCompare(b))];
  }, [products, allStoreCategories]);

  const brands = useMemo(() => {
    const raw = products.map(p => p.brand);
    return ['All', ...new Set(raw.filter(Boolean))];
  }, [products]);

  const categoryCounts = useMemo(() => {
    const counts = { All: products.length };
    categories.forEach(cat => {
      if (cat === 'All') return;
      counts[cat] = products.filter(p => {
        const pCat = typeof p.category === 'object' ? p.category?.name : p.category;
        return pCat?.toLowerCase() === cat.toLowerCase();
      }).length;
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
      const pCat = typeof p.category === 'object' ? p.category?.name : p.category;
      const matchCat = activeCategory === 'All' || pCat?.toLowerCase() === activeCategory.toLowerCase();
      const matchBrand = activeBrand === 'All' || p.brand?.toLowerCase() === activeBrand.toLowerCase();
      return matchCat && matchBrand;
    });
  }, [activeCategory, activeBrand, products]);

  // Best Sellers
  const bestSellers = useMemo(() => {
    return filteredProducts.filter(p => p.is_featured);
  }, [filteredProducts]);

  // Main grid: deduplicated
  const bestSellerIds = useMemo(() => new Set(bestSellers.map(p => p.id)), [bestSellers]);
  const mainProducts = useMemo(() => filteredProducts.filter(p => !bestSellerIds.has(p.id)), [filteredProducts, bestSellerIds]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'All') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
    if (isFilterOpen) setIsFilterOpen(false);
  };

  const FilterContent = () => (
    <>
      <div className="tech-filter-group">
        <h3 className="tech-filter-label">Categories</h3>
        <div className="tech-filter-options">
          {categories.map(cat => (
            <button
              key={cat}
              className={`tech-filter-link ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setFilter('category', cat)}
            >
              <span className="filter-text">{cat}</span>
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
              onClick={() => setFilter('brand', brand)}
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
    <div className="workspace-page workspace-shop-container">
      {/* Tech Shop Header */}
      <section className="workspace-hero workspace-shop-hero">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="workspace-eyebrow">Professional Ecosystem</p>
            <h1 className="workspace-title">
              {activeBrand !== 'All' ? activeBrand : 'The Master'} <span>{activeCategory !== 'All' ? activeCategory : 'Collection'}</span>
            </h1>
            <p className="workspace-subtitle">
              {activeBrand !== 'All' || activeCategory !== 'All' 
                ? `Exploring our premium range of ${activeBrand !== 'All' ? activeBrand : ''} ${activeCategory !== 'All' ? activeCategory.toLowerCase() : 'hardware'}.`
                : 'Curated precision hardware for the high-end professional.'}
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

          {/* Shop by Brand Quick Nav */}
          <div className={`tech-brand-nav ${isBrandNavCollapsed ? 'collapsed' : ''}`}>
            <div 
              className="brand-nav-header" 
              onClick={() => setIsBrandNavCollapsed(!isBrandNavCollapsed)}
              style={{ cursor: 'pointer' }}
            >
              <div className="brand-nav-header-text">
                <h2 className="brand-nav-title">Shop by Brand</h2>
                <p className="brand-nav-subtitle">Quick access to industry-leading manufacturers</p>
              </div>
              <div className="brand-nav-toggle mobile-only">
                {isBrandNavCollapsed ? <FiChevronDown /> : <FiChevronUp />}
              </div>
            </div>

            <AnimatePresence>
              {!isBrandNavCollapsed && (
                <motion.div 
                  className="brand-nav-grid"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  {[
                    { name: 'Apple', icon: <SiApple /> },
                    { name: 'Dell', icon: <SiDell /> },
                    { name: 'Lenovo', icon: <SiLenovo /> },
                    { name: 'HP', icon: <SiHp /> },
                    { name: 'Razer', icon: <SiRazer /> },
                    { name: 'ASUS', icon: <SiAsus /> },
                    { name: 'Microsoft', icon: <FiMonitor /> },
                    { name: 'Intel', icon: <SiIntel /> },
                    { name: 'AMD', icon: <SiAmd /> }
                  ].map(brand => {
                    const count = brandCounts[brand.name] || 0;
                    return (
                      <button 
                        key={brand.name} 
                        className={`brand-nav-card ${activeBrand === brand.name ? 'active' : ''} ${count === 0 ? 'empty' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilter('brand', activeBrand === brand.name ? 'All' : brand.name);
                        }}
                        disabled={loading}
                      >
                        <div className="brand-icon">{brand.icon}</div>
                        <div className="brand-info">
                          <span className="brand-name">{brand.name}</span>
                          <span className="brand-count">{count} {count === 1 ? 'Model' : 'Models'}</span>
                        </div>
                        {activeBrand === brand.name && <div className="brand-active-dot" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Best Sellers Section */}
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
                  <TechCard key={product.id} product={product} />
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
                  <TechCard key={product.id} product={product} />
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
                    <button onClick={() => { setSearchParams({}); }} className="reset-filters-btn">
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
