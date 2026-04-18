import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import logoFull from '../../assets/logos/logo-full.png';
import './Footer.css';

const Footer = () => {
  const { pathname } = useLocation();
  const isWorkspace = pathname.startsWith('/workspace');
  const isHomeLiving = pathname.startsWith('/home-living');

  const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || '#';
  const twitterUrl = import.meta.env.VITE_TWITTER_URL || '#';
  const youtubeUrl = import.meta.env.VITE_YOUTUBE_URL || '#';
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || '';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';

  const getTagline = () => {
    if (isWorkspace) return 'Expert-vetted workstations for creators, executives, and enterprise leaders.';
    if (isHomeLiving) return 'Premium home essentials and curated pieces for modern living.';
    return 'Plant-powered formulas for radiant, healthy skin. Vegan & cruelty-free.';
  };

  return (
    <footer className={`footer ${isWorkspace ? 'footer-workspace' : ''}`}>
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to={isWorkspace ? '/workspace' : '/'} className="footer-logo-link">
            <img src={logoFull} alt="RhaySource Ent." className="footer-logo-img" />
          </Link>
          <p className="footer-tagline">
            {getTagline()}
          </p>
          <div className="footer-socials">
            <a href={instagramUrl} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><FiInstagram /></a>
            <a href={twitterUrl} aria-label="Twitter" target="_blank" rel="noopener noreferrer"><FiTwitter /></a>
            <a href={youtubeUrl} aria-label="YouTube" target="_blank" rel="noopener noreferrer"><FiYoutube /></a>
          </div>
        </div>

        {isWorkspace ? (
          <>
            <div className="footer-col">
              <h3>Shop</h3>
              <ul>
                <li><Link to="/workspace/shop?category=Laptops">Laptops</Link></li>
                <li><Link to="/workspace/shop?category=Desktops">Desktops</Link></li>
                <li><Link to="/workspace/shop?category=Accessories">Accessories</Link></li>
                <li><Link to="/workspace/shop">All Products</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Company</h3>
              <ul>
                <li><Link to="/workspace/about">Our Story</Link></li>
                <li><Link to="/workspace/about">Why Workspace</Link></li>
                <li><Link to="/shop">Rhyea Store</Link></li>
                <li><Link to="/home-living">Home Store</Link></li>
              </ul>
            </div>
          </>
        ) : isHomeLiving ? (
          <>
            <div className="footer-col">
              <h3>Shop</h3>
              <ul>
                <li><Link to="/home-living/shop?category=Bathroom+%26+Cleaning">Bathroom</Link></li>
                <li><Link to="/home-living/shop?category=Kitchen">Kitchen</Link></li>
                <li><Link to="/home-living/shop?category=Home+Appliances">Appliances</Link></li>
                <li><Link to="/home-living/shop?category=Home+%26+Furniture">Furniture</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Company</h3>
              <ul>
                <li><Link to="/about">Our Story</Link></li>
                <li><Link to="/shop">Rhyea Store</Link></li>
                <li><Link to="/workspace">Workspace Store</Link></li>
                <li><Link to="/home-living/shop">All Products</Link></li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <div className="footer-col">
              <h3>Shop</h3>
              <ul>
                <li><Link to="/shop?category=Serums">Serums</Link></li>
                <li><Link to="/shop?category=Moisturizers">Moisturizers</Link></li>
                <li><Link to="/shop?category=Cleansers">Cleansers</Link></li>
                <li><Link to="/shop?category=Eye+Care">Eye Care</Link></li>
                <li><Link to="/shop?category=Masks">Masks</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Company</h3>
              <ul>
                <li><Link to="/about">Our Story</Link></li>
                <li><Link to="/workspace">Workspace Store</Link></li>
                <li><Link to="/home-living">Home Store</Link></li>
                <li><Link to="/shop">Rhyea Store</Link></li>
              </ul>
            </div>
          </>
        )}

        <div className="footer-col">
          <h3>Support</h3>
          <ul>
            <li><a href={`mailto:${contactEmail}`}>Email Us</a></li>
            <li><a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp Support</a></li>
            <li><Link to={isWorkspace ? "/workspace/about" : isHomeLiving ? "/home-living/shop" : "/about"}>
              {isWorkspace ? "Contact Us" : "Shipping & Returns"}
            </Link></li>
            <li><Link to="/about">FAQ</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom container">
        <p className="footer-copy">&copy; {new Date().getFullYear()} rhaysource. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
