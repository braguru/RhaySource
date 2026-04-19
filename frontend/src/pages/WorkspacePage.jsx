import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiZap, FiTarget, FiBox } from 'react-icons/fi';

import { useProducts } from '../hooks/useProducts';
import './WorkspacePage.css';
import './WorkspaceHome.css';

const CategoryCard = ({ title, description, image, link }) => (
  <motion.div 
    className="ws-category-card"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
  >
    <div className="ws-card-image">
      <img src={image} alt={title} />
      <div className="ws-card-overlay">
        <Link to={link || "/workspace/shop"} className="ws-explore-btn">
          Explore <FiArrowRight />
        </Link>
      </div>
    </div>
    <div className="ws-card-info">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </motion.div>
);

const FeatureItem = ({ icon: Icon, title, text }) => (
  <div className="ws-feature-item">
    <div className="ws-feature-icon">
      <Icon />
    </div>
    <div className="ws-feature-text">
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  </div>
);

export default function WorkspacePage() {
  const { products: liveProducts, store, loading } = useProducts('workspace');
  
  // Maintenance Mode Protection
  const isMaintenance = store && store.is_active === false;

  // Use live data exclusively (Remove static JSON fallback)
  const displayProducts = liveProducts;
  
  // Show only DB-tagged Best Sellers (max 3) — no static fallback
  const bestSellers = displayProducts.filter(p => p.is_featured).slice(0, 3);

  if (isMaintenance) {
    return (
      <div className="workspace-page workspace-home" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0b0c' }}>
        <div className="container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="ws-hero-eyebrow" style={{ color: '#38bdf8' }}>Operational Status: Offline</p>
            <h1 className="ws-hero-title">Collection Under <span>Maintenance</span></h1>
            <p className="ws-hero-subtitle" style={{ maxWidth: '600px', margin: '1.5rem auto' }}>
              The Professional Workspace collection is temporarily offline for catalog optimization. Please return shortly or explore our Beauty & Home ecosystems.
            </p>
            <Link to="/" className="ws-primary-btn" style={{ marginTop: '2rem' }}>Return to Hub</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-page workspace-home">
      {/* Cinematic Hero */}
      <section className="ws-hero">
        <div className="ws-hero-overlay"></div>
        <div className="container">
          <motion.div 
            className="ws-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <p className="ws-hero-eyebrow">The Professional Standard</p>
            <h1 className="ws-hero-title">Equip Your <br /><span>Mission.</span></h1>
            <p className="ws-hero-subtitle">
              Expert-vetted workstations and precision hardware for the world's most ambitious leaders and creators.
            </p>
            <div className="ws-hero-actions">
              <Link to="/workspace/shop" className="ws-primary-btn">
                Enter the Collection
              </Link>
              <Link to="/workspace/about" className="ws-secondary-btn">
                Our Standard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Ecosystems */}
      <section className="ws-section py-xl">
        <div className="container">
          <div className="ws-section-header">
            <h2 className="ws-section-title">Professional Ecosystems</h2>
            <p className="ws-section-subtitle">Tailored hardware solutions for every professional demand.</p>
          </div>
          
          <div className="ws-categories-grid">
            <CategoryCard 
              title="Creative Studios"
              description="High-fidelity displays and raw processing power for the visual elite."
              image="https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=800"
            />
            <CategoryCard 
              title="Executive Suites"
              description="Sleek, powerful mobile workstations for the modern decision maker."
              image="https://images.unsplash.com/photo-1542744094-24638eff58bb?auto=format&fit=crop&q=80&w=800"
            />
            <CategoryCard 
              title="Enterprise Labs"
              description="Multi-threaded taskmasters built for the data-intensive frontier."
              image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
            />
          </div>
        </div>
      </section>

      {/* The RhaySource Standard */}
      <section className="ws-banner-split">
        <div className="ws-banner-image">
          <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200" alt="Tech" />
        </div>
        <div className="ws-banner-content">
          <div className="ws-banner-inner">
            <h2 className="ws-banner-title">The RhaySource Technical Standard</h2>
            <p className="ws-banner-text">
              We don't just sell hardware; we curate high-performance tools that minimize friction and maximize output. Every workstation in our collection is stress-tested for reliability and thermal master.
            </p>
            
            <div className="ws-features-list">
              <FeatureItem 
                icon={FiShield} 
                title="Vetted Reliability" 
                text="Zero compromises on build quality or thermal efficiency." 
              />
              <FeatureItem 
                icon={FiZap} 
                title="Optimized Performance" 
                text="Pre-configured for peak workflows from day one." 
              />
              <FeatureItem 
                icon={FiBox} 
                title="Seamless Ecosystem" 
                text="Hubs and peripherals designed to work in harmony." 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Grid (Best Sellers) */}
      <section className="ws-section py-xl bg-darker">
        <div className="container">
          <div className="ws-section-header">
            <h2 className="ws-section-title">Best Sellers</h2>
            <p className="ws-section-subtitle">The most trusted tools in our professional arsenal.</p>
          </div>
          
          <div className="ws-highlights-grid">
            {bestSellers.map(product => (
              <motion.div 
                key={product.id}
                className="ws-highlight-card"
                whileHover={{ y: -10 }}
              >
                <div className="ws-h-image">
                  <img src={product.image_url || product.images?.primary} alt={product.name} />
                </div>
                <div className="ws-h-info">
                  <p className="ws-h-brand">{product.brand}</p>
                  <h3>{product.name}</h3>
                  <p className="ws-h-price">GH₵{Number(product.price).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</p>
                  <Link to={`/workspace/products/${product.slug || product.id}`} className="ws-h-cta">
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="ws-final-cta">
            <Link to="/workspace/shop" className="ws-primary-btn">
              Shop All Workstations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
