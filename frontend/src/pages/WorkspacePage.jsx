import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiArrowLeft, FiCpu, FiHardDrive, FiMonitor, FiShield } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import './WorkspacePage.css';
import './WorkspaceHome.css';

const CARD_PALETTES = [
  { bg: '#fef3e2', accent: '#f59e0b' },
  { bg: '#e0f2fe', accent: '#0ea5e9' },
  { bg: '#f0fdf4', accent: '#10b981' },
  { bg: '#fdf4ff', accent: '#a855f7' },
  { bg: '#fff1f2', accent: '#f43f5e' },
];

const FALLBACK_ITEMS = [
  { id: 'f1', name: 'ProStation Air', brand: 'RhaySource', price: 4500, image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600' },
  { id: 'f2', name: 'UltraBook Pro', brand: 'RhaySource', price: 6200, image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=600' },
  { id: 'f3', name: 'Workstation X', brand: 'RhaySource', price: 8900, image_url: 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&q=80&w=600' },
  { id: 'f4', name: 'PixelBook Ultra', brand: 'RhaySource', price: 5800, image_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=600' },
];

const BACKDROP_IMAGE = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1400';

const CARD_WIDTH = 340;

export default function WorkspacePage() {
  const navigate = useNavigate();
  const { products: liveProducts, store } = useProducts('workspace');
  const isMaintenance = store && store.is_active === false;
  const displayProducts = liveProducts || [];
  // Ensure we show at least 8 products, prioritizing best sellers/featured
  const prioritizedProducts = displayProducts.filter(p => p.is_best_seller || p.is_featured);
  const bestSellers = (prioritizedProducts.length > 0 ? prioritizedProducts : displayProducts).slice(0, 8);
  const featuredProduct = displayProducts[0] || null;

  // ── Scroll Parallax ──────────────────────────────────────────────
  const { scrollY } = useScroll();
  const heroGraphicsY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroContentY = useTransform(scrollY, [0, 800], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  // ── Mouse parallax ──────────────────────────────────────────────
  const heroRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 120, damping: 22, restDelta: 0.001 });
  const smoothY = useSpring(mouseY, { stiffness: 120, damping: 22, restDelta: 0.001 });

  // Foreground card — moves most, feels closest to viewer
  const node1X = useTransform(smoothX, v => v * 0.065);
  const node1Y = useTransform(smoothY, v => v * 0.055);
  // Mid-ground spec card — counter-direction creates depth illusion
  const node2X = useTransform(smoothX, v => v * -0.038);
  const node2Y = useTransform(smoothY, v => v * -0.030);
  // Background trust badge — slowest, furthest from viewer
  const node3X = useTransform(smoothX, v => v * 0.025);
  const node3Y = useTransform(smoothY, v => v * 0.020);
  // Backdrop — barely moves, feels anchored in place
  const backdropX = useTransform(smoothX, v => v * 0.008);
  const backdropY = useTransform(smoothY, v => v * 0.006);

  // ── 3D Tilt Effect ────────────────────────────────────────────────
  const rotateX = useTransform(smoothY, [-400, 400], [12, -12]);
  const rotateY = useTransform(smoothX, [-400, 400], [-12, 12]);

  const handleMouseMove = useCallback((e) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // ── Accordion Showcase ──────────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(0);

  const carouselItems = bestSellers.length > 0 ? bestSellers : FALLBACK_ITEMS;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  if (isMaintenance) {
    return (
      <div className="workspace-page workspace-home" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="ws-hero-eyebrow">Operational Status: Offline</p>
            <h1 className="ws-hero-title">Collection Under <span>Maintenance</span></h1>
            <p className="ws-hero-subtitle" style={{ maxWidth: '560px', margin: '1.5rem auto' }}>
              The Professional Workspace collection is temporarily offline. Please return shortly.
            </p>
            <Link to="/" className="ws-primary-btn" style={{ marginTop: '2rem', display: 'inline-flex' }}>Return to Hub</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.13, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] } }
  };


  return (
    <div className="workspace-page workspace-home">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        className="ws-hero"
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="ws-hero-bg" />

        <div className="container ws-hero-container">
          <div className="ws-hero-grid">

            {/* ── Graphics panel ─── */}
            <motion.div className="ws-hero-graphics" style={{ y: heroGraphicsY, opacity: heroOpacity }}>
              <div className="ws-orb ws-orb-1" />
              <div className="ws-orb ws-orb-2" />

              {/* Large atmospheric backdrop image */}
              <motion.div
                className="ws-composite-backdrop"
                style={{ x: backdropX, y: backdropY, rotateX, rotateY, transformPerspective: 1200 }}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, ease: [0.2, 0.65, 0.3, 0.9] }}
              >
                <img src={BACKDROP_IMAGE} alt="" className="ws-backdrop-img" />
                <div className="ws-backdrop-glass-overlay" />
                <div className="ws-backdrop-border" />
              </motion.div>

              {/* Node 1 — Product CTA card (foreground, bottom-right) */}
              <motion.div
                className="ws-node-wrapper ws-node-wrapper-1"
                style={{ x: node1X, y: node1Y, rotateX, rotateY, transformPerspective: 1200 }}
                initial={{ opacity: 0, y: 20, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.45, ease: [0.2, 0.65, 0.3, 0.9] }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
              >
                <div className="ws-node ws-node-1 ws-float-1">
                  <span className="ws-node-brand-tag">
                    {featuredProduct?.brand || 'RhaySource'}
                  </span>
                  <h4 className="ws-node-product-name">
                    {featuredProduct?.name || 'ProStation Air 14"'}
                  </h4>
                  <div className="ws-node-footer">
                    <span className="ws-node-price">
                      GH₵{Number(featuredProduct?.price || 4500).toLocaleString()}
                    </span>
                    <Link to="/workspace/shop" className="ws-node-cta-link">
                      Shop Now →
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Node 2 — Tech spec card (mid-ground, top-left) */}
              <motion.div
                className="ws-node-wrapper ws-node-wrapper-2"
                style={{ x: node2X, y: node2Y, rotateX, rotateY, transformPerspective: 1200 }}
                initial={{ opacity: 0, y: -20, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
              >
                <div className="ws-node ws-node-2 ws-float-2">
                  <p className="ws-spec-eyebrow">Technical Grade</p>
                  <div className="ws-spec-list">
                    <div className="ws-spec-row">
                      <FiCpu className="ws-spec-icon" />
                      <div className="ws-spec-text">
                        <span className="ws-spec-label">Processor</span>
                        <span className="ws-spec-value">Intel Core i7+</span>
                      </div>
                    </div>
                    <div className="ws-spec-row">
                      <FiHardDrive className="ws-spec-icon" />
                      <div className="ws-spec-text">
                        <span className="ws-spec-label">Storage</span>
                        <span className="ws-spec-value">Up to 1TB NVMe</span>
                      </div>
                    </div>
                    <div className="ws-spec-row">
                      <FiMonitor className="ws-spec-icon" />
                      <div className="ws-spec-text">
                        <span className="ws-spec-label">Display</span>
                        <span className="ws-spec-value">Full HD IPS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Node 3 — Trust badge (background, middle-left) */}
              <motion.div
                className="ws-node-wrapper ws-node-wrapper-3"
                style={{ x: node3X, y: node3Y, rotateX, rotateY, transformPerspective: 1200 }}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.75, ease: [0.2, 0.65, 0.3, 0.9] }}
                whileHover={{ scale: 1.08, zIndex: 10 }}
              >
                <div className="ws-node ws-node-3 ws-float-3">
                  <FiShield className="ws-trust-icon" />
                  <span className="ws-trust-label">Verified<br />Authentic</span>
                </div>
              </motion.div>
            </motion.div>

            {/* ── Content panel ─── */}
            <motion.div
              className="ws-hero-content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ y: heroContentY, opacity: heroOpacity }}
            >
              <motion.p className="ws-hero-eyebrow" variants={itemVariants}>
                Professional Workspace
              </motion.p>

              <motion.h1 className="ws-hero-title" variants={itemVariants}>
                Future Through <br /><span>Cutting-Edge</span><br />Technology.
              </motion.h1>

              <motion.p className="ws-hero-subtitle" variants={itemVariants}>
                Premium workstations, authentic hardware, and expert guidance —
                all priced transparently in GH₵ for Ghanaian professionals.
              </motion.p>

              <motion.div className="ws-hero-actions" variants={itemVariants}>
                <Link to="/workspace/shop" className="ws-primary-btn">
                  Discover Collection <FiArrowRight />
                </Link>
                <Link to="/workspace/about" className="ws-secondary-btn">
                  Our Story
                </Link>
              </motion.div>

              <motion.div className="ws-metrics" variants={itemVariants}>
                <div className="ws-metric">
                  <h3>100%</h3>
                  <p>Authentic Products</p>
                </div>
                <div className="ws-metric">
                  <h3>GH₵</h3>
                  <p>Local Transparent Pricing</p>
                </div>
                <div className="ws-metric">
                  <h3>24h</h3>
                  <p>Expert Support</p>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      <section className="ws-editorial-section">
        <div className="container">
          <div className="ws-editorial-header">
            <motion.h2
              className="ws-editorial-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              Workspace Best Sellers.
            </motion.h2>
            <motion.p
              className="ws-editorial-subtitle"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Explore our most popular hardware, precision-machined for the modern professional.
            </motion.p>
          </div>

          <div className="ws-editorial-split">
            {/* ── Left Column: Typography (1/3) ── */}
            <div className="ws-editorial-content">
              <motion.div 
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="ws-editorial-brand">
                  {carouselItems[activeIndex]?.brand || 'RhaySource'}
                </div>
                <h3 className="ws-editorial-name">
                  {carouselItems[activeIndex]?.name}
                </h3>
                <div className="ws-editorial-price">
                   GH₵{Number(carouselItems[activeIndex]?.price || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                </div>
                <p className="ws-editorial-desc">
                  Experience uncompromising performance combined with a minimalist aesthetic. 
                  Precision-machined for the modern professional.
                </p>
                
                {/* Navigation controls moved below the text for easy access */}
                <div className="ws-editorial-nav">
                  <button onClick={handlePrev} className="ws-nav-btn"><FiArrowLeft /></button>
                  <span className="ws-nav-indicator">0{activeIndex + 1} <span className="ws-nav-divider">/</span> 0{carouselItems.length}</span>
                  <button onClick={handleNext} className="ws-nav-btn"><FiArrowRight /></button>
                </div>
              </motion.div>
            </div>

            {/* ── Right Column: Visual Carousel (2/3) ── */}
            <div className="ws-editorial-visuals">
              <div className="ws-editorial-track">
                {carouselItems.map((product, index) => {
                  const isActive = index === activeIndex;
                  const offset = index - activeIndex;

                  return (
                    <motion.div
                      key={product.id || index}
                      className={`ws-editorial-card ${isActive ? 'active' : ''}`}
                      initial={false}
                      animate={{ 
                        x: `${offset * 105}%`, 
                        scale: isActive ? 1 : 0.85,
                        opacity: isActive ? 1 : 0.3
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      onClick={() => {
                        if (isActive) {
                          navigate(`/workspace/products/${product.slug || product.id}`);
                        } else {
                          setActiveIndex(index);
                        }
                      }}
                    >
                      <img
                        src={product.image_url || product.images?.primary || FALLBACK_ITEMS[0].image_url}
                        alt={product.name}
                        className="ws-editorial-image"
                        onError={(e) => { e.target.src = FALLBACK_ITEMS[0].image_url; }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value Proposition / Features ─────────────────────────────────── */}
      <section className="ws-features-section">
        <div className="container">
          <div className="ws-section-header">
            <motion.h2
              className="ws-section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              Engineered for the Extraordinary.
            </motion.h2>
            <motion.p
              className="ws-section-subtitle"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Every tool in our workspace collection is selected to remove friction from your workflow, enabling you to focus entirely on your craft.
            </motion.p>
          </div>

          <div className="ws-features-grid">
            {[
              { icon: <FiCpu />, title: 'Uncompromising Power', desc: 'Industry-leading silicon for rendering, compiling, and multitasking without breaking a sweat.' },
              { icon: <FiMonitor />, title: 'Pixel-Perfect Clarity', desc: 'Reference-grade displays that ensure what you see is exactly what your audience gets.' },
              { icon: <FiShield />, title: 'Enterprise Security', desc: 'Hardware-level encryption and biometrics to keep your intellectual property safe.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="ws-feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="ws-feature-icon">{feature.icon}</div>
                <h3 className="ws-feature-title">{feature.title}</h3>
                <p className="ws-feature-desc">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof / Brand Logos ──────────────────────────────────── */}
      <section className="ws-social-proof-section">
        <div className="container">
          <motion.p 
            className="ws-social-proof-eyebrow"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
          >
            Trusted by innovative teams across Africa
          </motion.p>
          <div className="ws-logos-grid">
             {['TechNova', 'Studio Alpha', 'FinEdge', 'Lumina Media', 'BuildSpace'].map((logo, i) => (
               <motion.div 
                 key={i} 
                 className="ws-logo-item"
                 initial={{ opacity: 0, scale: 0.9 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true, margin: '-50px' }}
                 transition={{ duration: 0.4, delay: i * 0.05 }}
               >
                 {logo}
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────────────────── */}
      <section className="ws-cta-section">
        <div className="container">
          <motion.div 
            className="ws-cta-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
          >
            <div className="ws-cta-content">
              <h2>Ready to build your workspace?</h2>
              <p>Elevate your productivity with our premium collection of professional hardware.</p>
              <Link to="/workspace/shop" className="ws-primary-btn ws-cta-btn">
                Shop the Collection <FiArrowRight />
              </Link>
            </div>
            <div className="ws-cta-glow"></div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
