import React from 'react';
import Button from '../ui/Button';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-background">
        <img src="/assets/hero.jpg" alt="Botanical Revival Serum on marble" />
      </div>
      
      <div className="hero-content container">
        <div className="hero-text-block">
          <p className="hero-eyebrow">rhaysource skincare</p>
          <h2 className="hero-title">RADIANCE<br />REDEFINED</h2>
          <p className="hero-subtitle">
            Plant-powered, scientifically crafted formulas for skin that glows from within.
          </p>
          <div className="hero-actions">
            <Button variant="primary" className="hero-cta">Explore Collection</Button>
            <Button variant="secondary" className="hero-cta-secondary">Learn More</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
