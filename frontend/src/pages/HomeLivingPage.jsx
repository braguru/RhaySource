import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield, FiTruck, FiStar, FiDroplet, FiGrid, FiSettings, FiLayout } from 'react-icons/fi';

import { useHomeLivingCart } from '../context/HomeLivingCartContext';
import { useProducts } from '../hooks/useProducts';
import './HomeLivingPage.css';

const CATEGORIES = [
  { name: 'Bathroom & Cleaning', tagline: 'Refined daily rituals', icon: <FiDroplet />, color: '#7c9e85', bg: '/assets/home/lifestyle/cat-bathroom.png' },
  { name: 'Kitchen', tagline: 'Culinary excellence', icon: <FiGrid />, color: '#c67c52', bg: '/assets/home/lifestyle/cat-kitchen.png' },
  { name: 'Home Appliances', tagline: 'Intelligent automation', icon: <FiSettings />, color: '#6b85a0', bg: '/assets/home/lifestyle/cat-appliances.png' },
  { name: 'Home & Furniture', tagline: 'Curated living spaces', icon: <FiLayout />, color: '#9b7e5a', bg: '/assets/home/lifestyle/cat-furniture.png' },
];

const TRUST_ITEMS = [
  { icon: FiShield, title: 'Quality Guaranteed', text: 'Every product is sourced from verified brands and inspected before delivery.' },
  { icon: FiTruck,  title: 'Nationwide Delivery', text: 'Reliable delivery across Ghana with real-time order tracking.' },
  { icon: FiStar,   title: 'Expert Curation',    text: 'Our team hand-picks every item for quality, durability, and value.' },
];

// Aesthetic Gallery stack configurations (Symmetric peeking)
const GALLERY_CONFIG = {
  desktop: { step: 35, scaleStep: 0.05, opacityStep: 0 }, // Small step for "peek", solid opacity
  mobile:  { step: 25, scaleStep: 0.05, opacityStep: 0 }
};




// Cards flow right → left.
// offset +1 (next card)  : peeks from the RIGHT  → slides in to become active
// offset  0 (active)     : full size, centre
// offset -1,-2,-3 (past) : stack up on the LEFT  → each card moves further left as more arrive

// Normalised offset: 0 = active, -1/-2/-3 = stacked past, 1 = incoming
const getOffset = (idx, activeIdx, total) => {
  if (total === 0) return 99;
  let d = ((idx - activeIdx) % total + total) % total;
  if (d > total / 2) d -= total;
  return d;
};

export default function HomeLivingPage() {
  const navigate   = useNavigate();
  const { products: liveProducts, store } = useProducts('home-living');
  const { addToHomeCart } = useHomeLivingCart();

  const [activeIdx,  setActiveIdx]  = useState(0);
  const [isPaused,   setIsPaused]   = useState(false);
  const [isDesktop,  setIsDesktop]  = useState(false);

  const displayProducts = liveProducts || [];
  const isMaintenance   = store && store.is_active === false;

  const bestSellers  = displayProducts.filter(p => p.is_best_seller);
  const featuredItems = displayProducts.filter(p => p.is_featured && !p.is_best_seller);
  const baseItems    = [...bestSellers, ...featuredItems].slice(0, 12);

  // Detect breakpoint for stack positions
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth > 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Auto-advance every 6.5 s; pauses on hover
  useEffect(() => {
    if (isPaused || baseItems.length <= 1) return;
    const id = setInterval(() => setActiveIdx(i => (i + 1) % baseItems.length), 6500);
    return () => clearInterval(id);
  }, [isPaused, baseItems.length]);

  const config = isDesktop ? GALLERY_CONFIG.desktop : GALLERY_CONFIG.mobile;


  const getCardAnimate = (offset) => {
    const abs = Math.abs(offset);
    if (abs > 2) return null; // Show active + 2 on each side

    return {
      x: offset * config.step,
      y: 0,
      scale: 1 - (abs * config.scaleStep), 
      rotate: 0,
      opacity: 1, // Make it solid
      zIndex: 10 - abs,
      filter: abs > 0 ? 'brightness(0.9)' : 'brightness(1)' // Slightly dim background cards
    };
  };



  const handleDragEnd = (_, info) => {
    if (info.offset.x < -60 && baseItems.length > 1) setActiveIdx(i => (i + 1) % baseItems.length);
    if (info.offset.x >  60 && baseItems.length > 1) setActiveIdx(i => (i - 1 + baseItems.length) % baseItems.length);
  };

  if (isMaintenance) {
    return (
      <div className="hl-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="hl-eyebrow">Operational Status: Offline</p>
            <h1 className="hl-hero-title">Collection Under <span>Maintenance</span></h1>
            <p className="hl-hero-subtitle" style={{ maxWidth: '600px', margin: '1.5rem auto' }}>
              The Home & Living collection is temporarily offline. Please return shortly.
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
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            <p className="hl-eyebrow">Home & Living</p>
            <h1 className="hl-hero-title">Your Home,<br /><span>Perfected.</span></h1>
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
              transition={{ duration: 1, delay: i * 0.12, ease: 'easeOut' }}
            >
              <Link
                to={`/home-living/shop?category=${encodeURIComponent(cat.name)}`}
                className="hl-category-card"
                style={{ '--cat-color': cat.color, backgroundImage: `url(${cat.bg})` }}
              >
                <div className="hl-cat-overlay" />
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

      {/* Aesthetic Gallery — stacked card deck (all screen sizes) */}
      {baseItems.length > 0 && (
        <section className="hl-aesthetic-gallery">
          <div className="hl-gallery-split container">

            {/* Left: deck */}
            <div
              className="hl-deck-col"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="hl-deck-stack">
                {baseItems.map((item, idx) => {
                  const offset = getOffset(idx, activeIdx, baseItems.length);
                  const anim   = getCardAnimate(offset);
                  if (!anim) return null;

                  return (
                    <motion.div
                      key={item.id}
                      className="hl-deck-card"
                      animate={anim}
                      transition={{ type: 'spring', stiffness: 110, damping: 22 }}
                      drag={offset === 0 ? 'x' : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.6}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (offset === 0) navigate(`/home-living/products/${item.slug || item.id}`);
                        else setActiveIdx(idx); // clicking a stacked card brings it to front
                      }}
                      style={{ cursor: offset === 0 ? 'grab' : 'pointer' }}
                    >
                      <img
                        src={item.image_url || item.images?.primary}
                        alt={item.name}
                        className="hl-deck-img"
                        draggable={false}
                      />
                      {offset === 0 && (
                        <div className="hl-deck-info">
                          <div className="hl-deck-price-row">
                            <span className="hl-deck-price">GH₵{Number(item.price || 0).toLocaleString()}</span>
                            {item.original_price && Number(item.original_price) > Number(item.price) && (
                              <span className="hl-deck-orig">GH₵{Number(item.original_price).toLocaleString()}</span>
                            )}
                          </div>
                          <p className="hl-deck-name">{item.name}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Dot indicators */}
              <div className="hl-deck-dots">
                {baseItems.map((_, i) => (
                  <button
                    key={i}
                    className={`hl-deck-dot${i === activeIdx ? ' active' : ''}`}
                    onClick={() => setActiveIdx(i)}
                    aria-label={`Go to card ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right: editorial text */}
            <div className="hl-deck-text">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9 }}
              >
                <p className="hl-eyebrow" style={{ marginBottom: '1.5rem' }}>Gallery</p>
                <h2 className="hl-gallery-heading">
                  Find your dream <span>aesthetic</span>
                </h2>

                <p className="hl-gallery-body">
                  You should feel safe when sitting in, or leaning on the piece,
                  and you shouldn't be able to recognise any sway, give or flex in it.
                </p>
                <Link to="/home-living/shop" className="hl-gallery-cta">
                  Browse the collection <FiArrowRight />
                </Link>
              </motion.div>
            </div>



          </div>
        </section>
      )}

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
