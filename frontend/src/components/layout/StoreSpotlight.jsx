import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiArrowRight, FiStar } from 'react-icons/fi';
import './StoreSpotlight.css';

const STORES = [
  { 
    name: 'Skincare', 
    slug: 'skincare', 
    path: '/', 
    description: 'Pure, organic formulas for your skin ritual.',
    accent: '#FEBB00',
    icon: '✨'
  },
  { 
    name: 'Home & Living', 
    slug: 'home-living', 
    path: '/home-living', 
    description: 'Curated essentials for an elevated home.',
    accent: '#7c9e85',
    icon: '🏠'
  },
  { 
    name: 'Workspace', 
    slug: 'workspace', 
    path: '/workspace', 
    description: 'Precision hardware for high-performance setups.',
    accent: '#38bdf8',
    icon: '💻'
  }
];

export default function StoreSpotlight() {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  
  const timerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Determine current store context
  const activeStoreSlug = useMemo(() => {
    if (pathname.startsWith('/workspace')) return 'workspace';
    if (pathname.startsWith('/home-living')) return 'home-living';
    return 'skincare';
  }, [pathname]);

  const isAllowedPage = useMemo(() => {
    const mainPaths = ['/', '/shop', '/workspace', '/workspace/shop', '/home-living', '/home-living/shop'];
    return mainPaths.includes(pathname);
  }, [pathname]);

  const otherStores = useMemo(() => STORES.filter(s => s.slug !== activeStoreSlug), [activeStoreSlug]);

  // Activity tracking logic
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      // If the ad is already visible, we don't hide it instantly, 
      // but if it's waiting to show, we reset the check.
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  useEffect(() => {
    // Reset and start monitor
    setIsVisible(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (!isAllowedPage || isDismissed) return;

    // Monitor for idleness
    // The ad will only show if:
    // 1. We are on an allowed page
    // 2. We haven't been dismissed
    // 3. The user has been IDLE for at least 15 seconds
    // 4. At least 40 seconds have passed since the page load (Initial Buffer)
    
    let initialBufferPassed = false;
    setTimeout(() => { initialBufferPassed = true; }, 30000); // 30s initial wait

    timerRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      
      if (initialBufferPassed && idleTime > 15000 && !isVisible) {
        // Show Ad
        setCurrentAdIndex(prev => (prev + 1) % otherStores.length);
        setIsVisible(true);
      }
    }, 5000); // Check idle status every 5 seconds

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pathname, isDismissed, isAllowedPage, otherStores.length]);

  // Handle re-showing after auto-hide
  useEffect(() => {
    if (!isVisible && !isDismissed && isAllowedPage) {
      // When it hides, reset the activity clock to force another 2-minute "quiet period"
      lastActivityRef.current = Date.now() + 120000; // Push next appearance 2 mins into the future
    }
  }, [isVisible, isDismissed, isAllowedPage]);

  if (isDismissed || otherStores.length === 0) return null;

  const ad = otherStores[currentAdIndex] || otherStores[0];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="store-spotlight-container"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <div className="spotlight-card glass" style={{ '--accent': ad.accent }}>
            <button 
              className="spotlight-close" 
              onClick={() => {
                setIsVisible(false);
                setIsDismissed(true);
              }}
              title="Dismiss for this session"
            >
              <FiX />
            </button>
            
            <div className="spotlight-content">
              <div className="spotlight-badge">
                <FiStar className="star-icon" />
                <span>Discovery</span>
              </div>
              
              <div className="spotlight-header">
                <span className="spotlight-icon">{ad.icon}</span>
                <div className="spotlight-title-group">
                  <h3>Explore {ad.name}</h3>
                  <p>{ad.description}</p>
                </div>
              </div>

              <Link 
                to={ad.path} 
                className="spotlight-cta"
                onClick={() => setIsVisible(false)}
              >
                <span>Visit Store</span>
                <FiArrowRight />
              </Link>
            </div>

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
