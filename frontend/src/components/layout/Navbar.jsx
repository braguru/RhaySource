import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiMenu, FiX, FiArrowRight, FiChevronDown } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useTechCart } from '../../context/TechCartContext';
import { useHomeLivingCart } from '../../context/HomeLivingCartContext';
import productsData from '../../data/products.json';
import techData from '../../data/tech-products.json';
import homeData from '../../data/home-products.json';
import { toSlug } from '../../utils/slug';
import logoFull from '../../assets/logos/logo-full.png';
import logoIcon from '../../assets/logos/logo-icon.png';
import './Navbar.css';

const STORES = [
  { name: 'Skincare',      path: '/',            label: 'Beauty & Wellness',    accent: '#FEBB00' },
  { name: 'Home & Living', path: '/home-living', label: 'Home, Kitchen & More', accent: '#7c9e85' },
  { name: 'Workspace',     path: '/workspace',   label: 'Laptops & Tech',       accent: '#38bdf8' },
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

  const searchInputRef = useRef(null);
  const storesRef      = useRef(null);

  const activeCartCount  = isWorkspace ? techCartCount  : isHomeLiving ? homeCartCount  : cartCount;
  const activeIsCartOpen = isWorkspace ? isTechCartOpen : isHomeLiving ? isHomeCartOpen : isCartOpen;
  const activeToggleCart = isWorkspace ? toggleTechCart : isHomeLiving ? toggleHomeCart : toggleCart;

  const bagLabel = isWorkspace ? 'Workspace Bag' : isHomeLiving ? 'Home Bag' : 'Bag';

  const homePath  = isWorkspace ? '/workspace' : isHomeLiving ? '/home-living' : '/';
  const shopPath  = isWorkspace ? '/workspace/shop'  : isHomeLiving ? '/home-living/shop'  : '/shop';
  const aboutPath = isWorkspace ? '/workspace/about' : '/about';

  useEffect(() => {
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
      const source = isWorkspace ? techData.products : isHomeLiving ? homeData.products : productsData.products;
      const filtered = source.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, isWorkspace, isHomeLiving]);

  const handleSearchClose = () => { setIsSearchOpen(false); setSearchQuery(''); };

  const handleResultClick = (product) => {
    const route = product.id.startsWith('TECH-')
      ? `/workspace/products/${product.id}`
      : product.id.startsWith('HOME-')
      ? `/home-living/products/${product.id}`
      : `/products/${toSlug(product.name)}`;
    navigate(route);
    handleSearchClose();
  };

  const searchPlaceholder = isWorkspace
    ? 'Search workstations...'
    : isHomeLiving
    ? 'Search home products...'
    : 'Search solutions...';

  return (
    <header className={`navbar-wrapper ${isHome ? 'navbar-absolute' : 'navbar-sticky'} ${isWorkspace ? 'navbar-workspace' : ''}`}>
      <div className="container">
        <nav className="navbar glass">

          <Link to={homePath} className="navbar-brand">
            <img src={logoFull} alt="RhaySource Ent." className={`navbar-logo-full ${isWorkspace ? 'logo-tech' : ''}`} />
            <img src={logoIcon} alt="RhaySource"      className={`navbar-logo-icon ${isWorkspace ? 'logo-tech' : ''}`} />
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
                  {STORES.map(store => {
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
              {STORES.map(store => {
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
                      <img src={product.images.primary} alt={product.name} />
                      <div className="result-info">
                        <p className="result-name">{product.name}</p>
                        <p className="result-category">{product.category}</p>
                      </div>
                      <FiArrowRight className="result-arrow" />
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim().length > 1 && (
                <div className="search-results-dropdown no-results glass">
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
  );
};

export default Navbar;
