import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiHardDrive, FiMonitor, FiCpu as FiRam, FiSliders, FiX, FiSearch } from 'react-icons/fi';
import techProducts from '../data/tech-products.json';
import { useTechCart } from '../context/TechCartContext';
import './WorkspacePage.css';
import './WorkspaceShopPage.css';

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
          <img src={product.images.primary} alt={product.name} />
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
  const { products } = techProducts;

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

          <motion.div layout className="tech-product-grid">
            <AnimatePresence mode="popLayout">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <TechCard key={product.id} product={product} />
                ))
              ) : (
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
              )}
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
