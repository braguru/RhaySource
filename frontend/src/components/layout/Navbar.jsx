import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiMenu, FiX, FiArrowRight, FiChevronDown } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useTechCart } from '../../context/TechCartContext';
import { useHomeLivingCart } from '../../context/HomeLivingCartContext';
import { useSettings } from '../../hooks/useSettings';

import { toSlug } from '../../utils/slug';
import logoFull from '../../assets/logos/logo-full.png';
import logoFullWorkspace from '../../assets/logo-full.svg';
import logoIcon from '../../assets/logos/logo-icon.png';
import { supabase } from '../../lib/supabase';
import './Navbar.css';

// Initial structure for static properties, visibility will be dynamic
const STATIC_STORES = [
  { name: 'Skincare',      slug: 'skincare',      path: '/',            label: 'Beauty & Wellness',    accent: '#FEBB00' },
  { name: 'Home & Living', slug: 'home-living',  path: '/home-living', label: 'Home, Kitchen & More', accent: '#7c9e85' },
  { name: 'Workspace',     slug: 'workspace',     path: '/workspace',   label: 'Laptops & Tech',       accent: '#38bdf8' },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isWorkspace  = pathname.startsWith('/workspace');
  const isHomeLiving = pathname.startsWith('/home-living');
  const isHome       = pathname === '/';

  const { cartCount, isCartOpen, toggleCart } = useCart();
  const { techCartCount, isTechCartOpen, toggleTechCart } = useTechCart();
  const { homeCartCount, isHomeCartOpen, toggleHomeCart } = useHomeLivingCart();

  const [menuOpen,     setMenuOpen]     = useState(false);
  const [storesOpen,   setStoresOpen]   = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeStores, setActiveStores] = useState(STATIC_STORES);

  const searchInputRef = useRef(null);
  const storesRef      = useRef(null);

  const activeCartCount  = isWorkspace ? techCartCount  : isHomeLiving ? homeCartCount  : cartCount;
  const activeIsCartOpen = isWorkspace ? isTechCartOpen : isHomeLiving ? isHomeCartOpen : isCartOpen;
  const activeToggleCart = isWorkspace ? toggleTechCart : isHomeLiving ? toggleHomeCart : toggleCart;

  const bagLabel = isWorkspace ? 'Workspace Bag' : isHomeLiving ? 'Home Bag' : 'Bag';

  const { settings } = useSettings();
  const broadcasts = settings.broadcasts || {};
  const brandName = settings.branding?.brand_name || 'RhaySource';

  const homePath  = isWorkspace ? '/workspace' : isHomeLiving ? '/home-living' : '/';
  const shopPath  = isWorkspace ? '/workspace/shop'  : isHomeLiving ? '/home-living/shop'  : '/shop';
  const aboutPath = isWorkspace ? '/workspace/about' : '/about';

  // Announcement Logic (Priority: Store > Global)
  let activeAnnouncement = null;
  let announcementColor = '#000000'; // Default black

  if (isWorkspace && broadcasts.workspace?.is_active) {
    activeAnnouncement = broadcasts.workspace.text;
    announcementColor = broadcasts.workspace.color || '#1e3a8a';
  } else if (isHomeLiving && broadcasts['home-living']?.is_active) {
    activeAnnouncement = broadcasts['home-living'].text;
    announcementColor = broadcasts['home-living'].color || '#7c9e85';
  } else if (!isWorkspace && !isHomeLiving && broadcasts.skincare?.is_active) {
    activeAnnouncement = broadcasts.skincare.text;
    announcementColor = broadcasts.skincare.color || '#ffca28';
  } else if (broadcasts.global?.is_active) {
    activeAnnouncement = broadcasts.global.text;
    announcementColor = broadcasts.global.color || '#000000';
  }

  useEffect(() => {
    async function fetchActiveStores() {
      const { data, error } = await supabase.from('stores').select('slug, is_active, accent_color');
      if (!error && data) {
        // Filter our static list by the database's live status
        const live = STATIC_STORES.filter(s => {
          const dbStore = data.find(db => db.slug === s.slug);
          return dbStore ? dbStore.is_active : true; // Default to true if not in DB yet
        });
        setActiveStores(live);
      }
    }
    fetchActiveStores();

    const handler = (e) => {
      if (storesRef.current && !storesRef.current.contains(e.target)) setStoresOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setStoresOpen(false); setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const storeSlug = isWorkspace ? 'workspace' : isHomeLiving ? 'home-living' : 'skincare';
      const fetchResults = async () => {
        const { data } = await supabase
          .from('products')
          .select('*, stores(slug, is_active)')
          .eq('stores.slug', storeSlug)
          .or(`name.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
          .limit(5);
        setSearchResults(data ? data.filter(p => p.stores?.slug === storeSlug) : []);
      };
      fetchResults();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, isWorkspace, isHomeLiving]);

  const handleSearchClose = () => { setIsSearchOpen(false); setSearchQuery(''); };

  const handleResultClick = (product) => {
    const storeSlug = product.stores?.slug;
    let route;
    if (storeSlug === 'workspace') route = `/workspace/products/${product.slug || product.id}`;
    else if (storeSlug === 'home-living') route = `/home-living/products/${product.slug || product.id}`;
    else route = `/products/${product.slug || product.id}`;
    navigate(route);
    handleSearchClose();
  };

  const searchPlaceholder = isWorkspace
    ? 'Search workstations...'
    : isHomeLiving
    ? 'Search home products...'
    : 'Search solutions...';

  return (
    <>
      {activeAnnouncement && (
        <div className="announcement-bar" style={{ backgroundColor: announcementColor }}>
          <div className="announcement-container">
            <span className="announcement-text">{activeAnnouncement}</span>
          </div>
        </div>
      )}
      <header className={`navbar-wrapper ${isHome ? 'navbar-absolute' : 'navbar-sticky'} ${isWorkspace ? 'navbar-workspace' : ''} ${activeAnnouncement ? 'with-announcement' : ''}`}>
        <div className="container">
          <nav className="navbar glass">

            <Link to={homePath} className="navbar-brand">
              {settings.branding?.brand_logo_url ? (
                <img src={settings.branding.brand_logo_url} alt={brandName} className={`navbar-logo-full ${isWorkspace ? 'logo-tech' : ''}`} style={{ objectFit: 'contain' }} />
              ) : (
                <>
                  <img src={isWorkspace ? logoFullWorkspace : logoFull} alt={brandName} className={`navbar-logo-full ${isWorkspace ? 'logo-tech' : ''}`} />
                  {!isWorkspace && <img src={logoIcon} alt={brandName} className={`navbar-logo-icon`} />}
                </>
              )}
            </Link>

          {/* Desktop links */}
          <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>

            <li><Link to={shopPath}  onClick={() => setMenuOpen(false)}>Shop</Link></li>
            {!isHomeLiving && (
              <li><Link to={aboutPath} onClick={() => setMenuOpen(false)}>About</Link></li>
            )}

            {/* Our Stores dropdown — desktop */}
            <li className="stores-nav-item desktop-stores" ref={storesRef}>
              <button
                className={`stores-trigger ${storesOpen ? 'open' : ''}`}
                onClick={() => setStoresOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={storesOpen}
              >
                Our Stores <FiChevronDown className="stores-chevron" />
              </button>

              {storesOpen && (
                <div className="stores-dropdown glass">
                  <div className="dropdown-label">Explore Ecosystems</div>
                  {activeStores.map(store => {
                    const isActive = store.path === '/'
                      ? !isWorkspace && !isHomeLiving
                      : pathname.startsWith(store.path);
                    return (
                      <Link
                        key={store.path}
                        to={store.path}
                        className={`store-item ${isActive ? 'active' : ''}`}
                        onClick={() => setStoresOpen(false)}
                      >
                        <div className="store-info">
                          <span className="store-name">{store.name}</span>
                          <span className="store-label">{store.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </li>

            {/* Our Stores — mobile */}
            <li className="mobile-stores-group">
              <span className="mobile-stores-label">Our Stores</span>
              {activeStores.map(store => {
                const isActive = store.path === '/'
                  ? !isWorkspace && !isHomeLiving
                  : pathname.startsWith(store.path);
                return (
                  <Link
                    key={store.path}
                    to={store.path}
                    className={`mobile-store-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                    style={isActive ? { '--active-color': store.accent } : {}}
                  >
                    <span className="mobile-store-name">{store.name}</span>
                  </Link>
                );
              })}
            </li>

          </ul>

          <div className="navbar-actions">
            <button
              aria-label="Search"
              className={`icon-btn search-trigger ${isSearchOpen ? 'active' : ''}`}
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <FiSearch />
            </button>
            <button
              aria-label="Cart"
              className={`icon-btn cart-btn ${activeIsCartOpen ? 'active' : ''} ${isWorkspace ? 'cart-btn-tech' : ''}`}
              onClick={activeToggleCart}
            >
              <div className="cart-icon-wrapper">
                <FiShoppingBag />
                {activeCartCount > 0 && (
                  <span className={`cart-badge ${isWorkspace ? 'badge-tech' : ''}`}>{activeCartCount}</span>
                )}
              </div>
              <span className="desktop-only-text">
                {bagLabel} ({activeCartCount})
              </span>
            </button>
            <button
              className="icon-btn mobile-menu-btn"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          {/* Search overlay */}
          <div className={`search-overlay ${isSearchOpen ? 'open' : ''}`}>
            <div className="search-bar-inner">
              <div className="search-input-wrapper">
                <FiSearch className="search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="search-close" onClick={handleSearchClose}><FiX /></button>
              </div>

              {searchResults.length > 0 ? (
                <div className="search-results-dropdown glass">
                  <p className="results-label">Quick Results</p>
                  {searchResults.map(product => (
                    <div key={product.id} className="search-result-item" onClick={() => handleResultClick(product)}>
                      <div className="cart-preview-item-image">
                        <img 
                          src={product.image_url || product.images?.primary || 'https://res.cloudinary.com/duhvgnorw/image/upload/v1776510657/rhaysource/placeholders/product-placeholder.jpg'} 
                          alt={product.name} 
                          onError={(e) => { e.target.src = 'https://res.cloudinary.com/duhvgnorw/image/upload/v1776510657/rhaysource/placeholders/product-placeholder.jpg'; }}
                        />
                      </div>
                      <div className="result-info">
                        <p className="result-name">{product.name}</p>
                        <p className="result-category">
                          {typeof product.category === 'object' ? (product.category?.name || 'Collection') : product.category}
                        </p>
                      </div>
                      <FiArrowRight className="result-arrow" />
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim().length > 1 && (
                <div className="search-results-dropdown no-results glass">
                  <div className="related-product-image">
                    <img 
                      src={'https://res.cloudinary.com/duhvgnorw/image/upload/v1776510657/rhaysource/placeholders/product-placeholder.jpg'} 
                      alt="No results" 
                      onError={(e) => { e.target.src = 'https://res.cloudinary.com/duhvgnorw/image/upload/v1776510657/rhaysource/placeholders/product-placeholder.jpg'; }}
                    />
                  </div>
                  <div className="no-results-content">
                    <FiX className="no-results-icon" />
                    <p className="no-results-title">No results found</p>
                    <p className="no-results-subtitle">Try adjusting your search.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </nav>
      </div>
      </header>
    </>
  );
};

export default Navbar;
