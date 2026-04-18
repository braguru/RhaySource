import React from 'react';
import { FiMail, FiPhone, FiMapPin, FiMessageCircle, FiHeart, FiSearch, FiAward } from 'react-icons/fi';
import ContactForm from '../components/features/ContactForm';
import { motion } from 'framer-motion';
import './AboutPage.css';

const values = [
  { 
    title: 'The Uncompromising Edit', 
    description: 'We don\'t just stock products; we curate breakthroughs. Every brand in our collection is meticulously vetted for ingredient integrity and clinical results.',
    icon: <FiSearch />
  },
  { 
    title: 'Soulfully Sourced', 
    description: '100% Vegan & Cruelty-Free. Our passion for beauty never comes at the cost of our compassion for nature and all living beings.',
    icon: <FiHeart />
  },
  { 
    title: 'Global Innovation, Local Care', 
    description: 'Bringing the world\'s most sophisticated dermatology—from Seoul to Paris—directly to the heart of our community with expert guidance.',
    icon: <FiAward />
  },
];

export default function AboutPage() {
  const email = import.meta.env.VITE_CONTACT_EMAIL;
  const whatsapp = import.meta.env.VITE_WHATSAPP_NUMBER;

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container about-hero-content">
          <motion.p 
            className="about-eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Philosophy
          </motion.p>
          <motion.h1 
            className="about-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            The Pursuit of <br /> Radiant Rituals
          </motion.h1>
          <motion.p 
            className="about-intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            RhaySource was born out of an uncompromising obsession with quality and a simple, heart-felt belief: 
            skincare is a profound act of self-care. It’s the quiet moment in your morning and the soothing 
            ritual of your evening. We don't just sell products; we curate the tools for your most radiant self.
          </motion.p>
        </div>
      </section>

      <section className="about-vision py-xl">
        <div className="container">
          <div className="vision-grid">
            <div className="vision-text">
              <h2 className="accent-heading">Driven by Passion</h2>
              <p>
                Our journey began with a frustration over inaccessible skin health. We realized that 
                true innovation—the kind that changes skin and boosts confidence—was often hidden behind 
                gatekeepers.
              </p>
              <p>
                Today, RhaySource is a bridge. We are a team of enthusiasts who spend our nights 
                researching ingredient synergies and our days ensuring that the best dermatological 
                advancements are available to you, right here. We believe everyone deserves premium 
                care, backed by science and delivered with passion.
              </p>
            </div>
            <div className="vision-stat-card">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Curated Products</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Authentic & Vetted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-values py-xl bg-soft">
        <div className="container">
          <div className="section-header">
            <h2>What Drives Us</h2>
            <p>The core convictions that guide every curation.</p>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <motion.div 
                key={v.title} 
                className="value-card"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="value-icon-box">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-contact py-xl" id="contact">
        <div className="container">
          <div className="contact-split">
            <div className="contact-details">
              <h2>Expert Guidance</h2>
              <p className="contact-details-intro">
                Skin health is personal. If you’re unsure where to start your ritual, 
                our consultants are here to help you build a routine that works for your unique skin.
              </p>

              <ul className="contact-info-list">
                {email && (
                  <li>
                    <FiMail className="contact-icon" />
                    <div>
                      <span className="contact-info-label">Email Us</span>
                      <a href={`mailto:${email}`} className="contact-info-value">{email}</a>
                    </div>
                  </li>
                )}
                {whatsapp && (
                  <li>
                    <FiMessageCircle className="contact-icon" />
                    <div>
                      <span className="contact-info-label">WhatsApp Concierge</span>
                      <a
                        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-info-value"
                      >
                        Start a Consultation
                      </a>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
