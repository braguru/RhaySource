import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield, FiTruck, FiStar, FiDroplet, FiGrid, FiSettings, FiLayout } from 'react-icons/fi';

import { useHomeLivingCart } from '../context/HomeLivingCartContext';
import { useProducts } from '../hooks/useProducts';
import './HomeLivingPage.css';

const CATEGORIES = [
  {
    name: 'Bathroom & Cleaning',
    tagline: 'Refined daily rituals',
    icon: <FiDroplet />,
    color: '#7c9e85',
    bg: '/assets/home/lifestyle/cat-bathroom.png'
  },
  {
    name: 'Kitchen',
    tagline: 'Culinary excellence',
    icon: <FiGrid />,
    color: '#c67c52',
    bg: '/assets/home/lifestyle/cat-kitchen.png'
  },
  {
    name: 'Home Appliances',
    tagline: 'Intelligent automation',
    icon: <FiSettings />,
    color: '#6b85a0',
    bg: '/assets/home/lifestyle/cat-appliances.png'
  },
  {
    name: 'Home & Furniture',
    tagline: 'Curated living spaces',
    icon: <FiLayout />,
    color: '#9b7e5a',
    bg: '/assets/home/lifestyle/cat-furniture.png'
  },
];

const TRUST_ITEMS = [
  { icon: FiShield, title: 'Quality Guaranteed', text: 'Every product is sourced from verified brands and inspected before delivery.' },
  { icon: FiTruck,  title: 'Nationwide Delivery', text: 'Reliable delivery across Ghana with real-time order tracking.' },
  { icon: FiStar,   title: 'Expert Curation',    text: 'Our team hand-picks every item for quality, durability, and value.' },
];

export default function HomeLivingPage() {
  const { products: liveProducts, store, loading } = useProducts('home-living');
  const { addToHomeCart } = useHomeLivingCart();
  
  // Maintenance Mode Protection
  const isMaintenance = store && store.is_active === false;

  // Use live data exclusively (Remove static JSON fallback)
  const displayProducts = liveProducts;

  // Show only DB-tagged Best Sellers (max 3) — no static fallback
  const featured = displayProducts.filter(p => p.is_featured).slice(0, 3);

  if (isMaintenance) {
    return (
      <div className="hl-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="hl-eyebrow" style={{ color: 'var(--studio-accent)' }}>Operational Status: Offline</p>
            <h1 className="hl-hero-title">Collection Under <span>Maintenance</span></h1>
            <p className="hl-hero-subtitle" style={{ maxWidth: '600px', margin: '1.5rem auto' }}>
              The Home & Living collection is temporarily offline as we curate new arrivals. Please return shortly or explore our other ecosystems.
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
      <section className="hl-hero">
        <div className="container">
          <motion.div
            className="hl-hero-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <p className="hl-eyebrow">Home & Living</p>
            <h1 className="hl-hero-title">
              Your Home,<br /><span>Perfected.</span>
            </h1>
            <p className="hl-hero-subtitle">
              Premium appliances, furniture, and essentials curated for the modern Ghanaian home.
            </p>
            <Link to="/home-living/shop" className="hl-hero-btn">
              Shop the Collection <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="hl-section container">
        <div className="hl-section-header">
          <h2>Shop by Category</h2>
          <p>Everything your home needs, under one roof.</p>
        </div>
        <div className="hl-category-grid">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.12, ease: "easeOut" }}
            >
              <Link
                to={`/home-living/shop?category=${encodeURIComponent(cat.name)}`}
                className="hl-category-card"
                style={{ 
                  '--cat-color': cat.color,
                  backgroundImage: `url(${cat.bg})`
                }}
              >
                <div className="hl-cat-overlay"></div>
                <div className="hl-cat-content">
                  <span className="hl-cat-icon">{cat.icon}</span>
                  <h3 className="hl-cat-name">{cat.name}</h3>
                  <p className="hl-cat-tagline">{cat.tagline}</p>
                  <span className="hl-cat-arrow"><FiArrowRight /></span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="hl-section hl-featured-bg">
        <div className="container">
          <div className="hl-section-header">
            <h2>Handpicked for You</h2>
            <p>Our team's top picks this season.</p>
          </div>
          <div className="hl-featured-grid">
            {featured.map((product, i) => (
              <motion.div
                key={product.id}
                className="hl-featured-card"
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link to={`/home-living/products/${product.slug || product.id}`} className="hl-featured-image-link">
                  <div className="hl-featured-image">
                    <img src={product.image_url || product.images?.primary} alt={product.name} />
                    <span className="hl-featured-badge">
                      {typeof product.category === 'object' ? (product.category?.name || 'Home & Living') : product.category}
                    </span>
                  </div>
                </Link>
                <div className="hl-featured-info">
                  <p className="hl-featured-brand">{product.brand}</p>
                  <h3 className="hl-featured-name">{product.name}</h3>
                  <div className="hl-featured-footer">
                    <span className="hl-featured-price">GH₵{product.price.toLocaleString()}</span>
                    <button className="hl-featured-add" onClick={() => addToHomeCart(product)}>
                      Add to Bag
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="hl-view-all">
            <Link to="/home-living/shop" className="hl-view-all-btn">
              View Full Collection <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="hl-section container hl-trust">
        {TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="hl-trust-item">
            <div className="hl-trust-icon"><Icon /></div>
            <h4>{title}</h4>
            <p>{text}</p>
          </div>
        ))}
      </section>

    </div>
  );
}
