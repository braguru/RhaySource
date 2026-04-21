import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiArrowRight, FiShoppingBag, FiStar } from 'react-icons/fi';
import './StoreSpotlight.css';

const STORES = [
  { 
    name: 'Skincare', 
    slug: 'skincare', 
    path: '/', 
    description: 'Pure, plant-powered formulas for your skin ritual.',
    accent: '#FEBB00',
    icon: '✨'
  },
  { 
    name: 'Home & Living', 
    slug: 'home-living', 
    path: '/home-living', 
    description: 'Curated essentials for a modern, elevated home.',
    accent: '#7c9e85',
    icon: '🏠'
  },
  { 
    name: 'Workspace', 
    slug: 'workspace', 
    path: '/workspace', 
    description: 'Precision hardware for high-performance workflows.',
    accent: '#38bdf8',
    icon: '💻'
  }
];

export default function StoreSpotlight() {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const activeStoreSlug = useMemo(() => {
    if (pathname.startsWith('/workspace')) return 'workspace';
    if (pathname.startsWith('/home-living')) return 'home-living';
    return 'skincare';
  }, [pathname]);

  // Only show on main entry pages (Home and Shop)
  const isAllowedPage = useMemo(() => {
    const mainPaths = [
      '/', '/shop', 
      '/workspace', '/workspace/shop', 
      '/home-living', '/home-living/shop'
    ];
    return mainPaths.includes(pathname);
  }, [pathname]);

  // Identify which store is currently active
  const otherStores = useMemo(() => {
    return STORES.filter(s => s.slug !== activeStoreSlug);
  }, [activeStoreSlug]);

  useEffect(() => {
    // Hide if not on an allowed page or if user dismissed it globally for this session
    if (!isAllowedPage || isDismissed) {
      setIsVisible(false);
      return;
    }

    // Reset visibility to false on path change to start the delay fresh
    setIsVisible(false);

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10000); // Increased to 10s for better user focus

    return () => clearTimeout(timer);
  }, [isDismissed, pathname, isAllowedPage]);

  // Rotate through other stores every time the component re-mounts or path changes
  useEffect(() => {
    setCurrentAdIndex(Math.floor(Math.random() * otherStores.length));
  }, [pathname, otherStores.length]);

  if (isDismissed || otherStores.length === 0) return null;

  const ad = otherStores[currentAdIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="store-spotlight-container"
          initial={{ opacity: 0, scale: 0.8, y: 50, x: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <div className="spotlight-card glass" style={{ '--accent': ad.accent }}>
            <button className="spotlight-close" onClick={() => setIsDismissed(true)}>
              <FiX />
            </button>
            
            <div className="spotlight-content">
              <div className="spotlight-badge">
                <FiStar className="star-icon" />
                <span>Eco-System Discovery</span>
              </div>
              
              <div className="spotlight-header">
                <span className="spotlight-icon">{ad.icon}</span>
                <div className="spotlight-title-group">
                  <h3>Browse {ad.name}</h3>
                  <p>{ad.description}</p>
                </div>
              </div>

              <Link 
                to={ad.path} 
                className="spotlight-cta"
                onClick={() => setIsVisible(false)}
              >
                <span>Switch to {ad.name}</span>
                <FiArrowRight />
              </Link>
            </div>

            {/* Subtle progress bar timer to indicate it's a "momentary" suggestion */}
            <motion.div 
              className="spotlight-timer-bar"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 15, ease: 'linear' }}
              onAnimationComplete={() => setIsVisible(false)}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
