import React from 'react';
import { FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h2 className="footer-logo">rhaysource</h2>
          <p className="footer-tagline">
            Plant-powered formulas for radiant, healthy skin. Vegan &amp; cruelty-free.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Instagram"><FiInstagram /></a>
            <a href="#" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" aria-label="YouTube"><FiYoutube /></a>
          </div>
        </div>

        <div className="footer-col">
          <h3>Skincare</h3>
          <ul>
            <li><a href="#skincare">Serums</a></li>
            <li><a href="#skincare">Moisturizers</a></li>
            <li><a href="#skincare">Cleansers</a></li>
            <li><a href="#skincare">Eye Care</a></li>
            <li><a href="#skincare">Masks</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Company</h3>
          <ul>
            <li><a href="#about">Our Story</a></li>
            <li><a href="#about">Ingredients</a></li>
            <li><a href="#routine">Routine Builder</a></li>
            <li><a href="#about">Sustainability</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Support</h3>
          <ul>
            <li><a href="#about">Contact Us</a></li>
            <li><a href="#about">Shipping &amp; Returns</a></li>
            <li><a href="#about">FAQ</a></li>
            <li><a href="#about">Retailer Inquiries</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom container">
        <p className="footer-copy">&copy; {new Date().getFullYear()} rhaysource. All rights reserved.</p>
        <a
          href="https://example.com/laptops/creator-workstation"
          className="footer-tech-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Tech Essentials &rarr;
        </a>
      </div>
    </footer>
  );
};

export default Footer;
