import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDroplet, FiSun, FiFeather, FiEye, FiWind, FiMoon, FiArrowRight } from 'react-icons/fi';
import HeroSection from '../components/features/HeroSection';
import ProductCard from '../components/features/ProductCard';
import productsData from '../data/products.json';
import './HomePage.css';

const categoryMeta = {
  Serums: { tagline: 'Targeted treatment', icon: FiDroplet, color: 'var(--color-blue)' },
  Moisturizers: { tagline: 'Hydrate & protect', icon: FiSun, color: 'var(--color-yellow-dark)' },
  Cleansers: { tagline: 'Clean, never stripped', icon: FiFeather, color: '#059669' },
  'Eye Care': { tagline: 'Brighten & restore', icon: FiEye, color: '#7C3AED' },
  Toners: { tagline: 'Balance & prep', icon: FiWind, color: '#DB2777' },
  Masks: { tagline: 'Deep renewal', icon: FiMoon, color: '#0891B2' },
};

export default function HomePage() {
  const { products } = productsData;
  const categories = Object.keys(categoryMeta);
  
  // Select 4 diverse real products for the "Daily Essentials" section
  const featuredIds = ['SKIN-1101', 'SKIN-1104', 'SKIN-1105', 'SKIN-1110'];
  const featured = products.filter(p => featuredIds.includes(p.id));

  const containerFade = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, staggerChildren: 0.15 } }
  };

  return (
    <>
      <HeroSection />

      <section className="home-categories py-xl" id="categories">
        <motion.div 
          className="container"
          variants={containerFade}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <div className="section-header">
            <h2>Shop By Category</h2>
            <p>Every formula, a different ritual.</p>
          </div>
          <div className="category-grid">
            {categories.map(cat => {
              const meta = categoryMeta[cat];
              const Icon = meta.icon;
              return (
                <motion.div key={cat} variants={containerFade}>
                  <Link
                    to={`/shop?category=${encodeURIComponent(cat)}`}
                    className="category-card"
                  >
                    <span className="category-icon" style={{ color: meta.color }}>
                      <Icon />
                    </span>
                    <h3 className="category-name">{cat}</h3>
                    <p className="category-tagline">{meta.tagline}</p>
                    <span className="category-arrow"><FiArrowRight /></span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section className="home-featured py-xl" id="skincare">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <h2>The Daily Essentials</h2>
            <p>Curated formulas engineered to support your skin barrier.</p>
          </motion.div>
          
          <motion.div 
            className="product-grid"
            variants={containerFade}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
          
          <div className="home-featured-cta">
            <Link to="/shop" className="view-all-link">
              View All Products <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-concern py-xl">
        <motion.div 
          className="container"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="concern-banner glass">
            <div className="concern-text">
              <h2>What's Your Skin Concern?</h2>
              <p>Filter by skin type — whether you're dealing with dryness, sensitivity, or oiliness, we have a formula for you.</p>
            </div>
            <div className="concern-tags">
              {['Dry', 'Oily', 'Sensitive', 'Normal', 'Combination', 'All'].map(type => (
                <Link
                  key={type}
                  to={`/shop?concern=${type === 'All' ? '' : encodeURIComponent(type)}`}
                  className="concern-tag"
                >
                  {type}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Laptop Referral Section */}
      <section className="laptop-referral">
        <div className="container">
          <motion.div 
            className="laptop-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="laptop-text">
              <h3>Equip Your Workspace</h3>
              <p>Discover our curated collection of premium laptops designed for high-performance creative workflows and enterprise leadership.</p>
            </div>
            <a href="https://example.com/laptops" className="btn btn-primary">Explore Tech Essentials</a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
