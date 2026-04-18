import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingBag, FiMenu, FiX, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import productsData from '../../data/products.json';
import { toSlug } from '../../utils/slug';
import logoFull from '../../assets/logos/logo-full.png';
import logoIcon from '../../assets/logos/logo-icon.png';
import './Navbar.css';

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === '/';
  const { cartCount, isCartOpen, toggleCart } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = productsData.products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleResultClick = (productName) => {
    navigate(`/products/${toSlug(productName)}`);
    handleSearchClose();
  };

  return (
    <header className={`navbar-wrapper ${isHome ? 'navbar-absolute' : 'navbar-sticky'}`}>
      <div className="container">
        <nav className="navbar glass">
          <Link to="/" className="navbar-brand">
            <img src={logoFull} alt="RhaySource Ent." className="navbar-logo-full" />
            <img src={logoIcon} alt="RhaySource" className="navbar-logo-icon" />
          </Link>

          <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <li><Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link></li>
            <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
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
              className={`icon-btn cart-btn ${isCartOpen ? 'active' : ''}`}
              onClick={toggleCart}
            >
              <div className="cart-icon-wrapper">
                <FiShoppingBag />
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </div>
              <span className="desktop-only-text">Bag ({cartCount})</span>
            </button>
            <button
              className="icon-btn mobile-menu-btn"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          {/* Search Overlay/Bar */}
          <div className={`search-overlay ${isSearchOpen ? 'open' : ''}`}>
            <div className="search-bar-inner">
              <div className="search-input-wrapper">
                <FiSearch className="search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search solutions (e.g. Serum, Vitamin C)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="search-close" onClick={handleSearchClose}>
                  <FiX />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="search-results-dropdown glass">
                  <p className="results-label">Quick Results</p>
                  {searchResults.map(product => (
                    <div 
                      key={product.id} 
                      className="search-result-item"
                      onClick={() => handleResultClick(product.name)}
                    >
                      <img src={product.images.primary} alt={product.name} />
                      <div className="result-info">
                        <p className="result-name">{product.name}</p>
                        <p className="result-category">{product.category}</p>
                      </div>
                      <FiArrowRight className="result-arrow" />
                    </div>
                  ))}
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
