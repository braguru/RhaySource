import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import logoFull from '../../assets/logos/logo-full.png';
import './Footer.css';

const Footer = () => {
  const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || '#';
  const twitterUrl = import.meta.env.VITE_TWITTER_URL || '#';
  const youtubeUrl = import.meta.env.VITE_YOUTUBE_URL || '#';
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || '';
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo-link">
            <img src={logoFull} alt="RhaySource Ent." className="footer-logo-img" />
          </Link>
          <p className="footer-tagline">
            Plant-powered formulas for radiant, healthy skin. Vegan &amp; cruelty-free.
          </p>
          <div className="footer-socials">
            <a href={instagramUrl} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><FiInstagram /></a>
            <a href={twitterUrl} aria-label="Twitter" target="_blank" rel="noopener noreferrer"><FiTwitter /></a>
            <a href={youtubeUrl} aria-label="YouTube" target="_blank" rel="noopener noreferrer"><FiYoutube /></a>
          </div>
        </div>

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
            <li><Link to="/about">Ingredients</Link></li>
            <li><Link to="/about">Sustainability</Link></li>
            <li><Link to="/shop">All Products</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Support</h3>
          <ul>
            <li><a href={`mailto:${contactEmail}`}>Email Us</a></li>
            <li><a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp Support</a></li>
            <li><Link to="/about">Shipping &amp; Returns</Link></li>
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
