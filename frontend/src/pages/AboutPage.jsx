import React from 'react';
import { FiMail, FiPhone, FiMapPin, FiMessageCircle } from 'react-icons/fi';
import ContactForm from '../components/features/ContactForm';
import './AboutPage.css';

const values = [
  { title: 'Vegan', description: 'Every formula is 100% plant-derived — no animal ingredients, ever.' },
  { title: 'Cruelty-Free', description: 'Leaping Bunny certified. Never tested on animals, anywhere in our supply chain.' },
  { title: 'Fragrance-Free Options', description: 'We offer fragrance-free alternatives for every sensitive skin concern.' },
  { title: 'Sustainable Sourcing', description: 'Botanical ingredients sourced from certified ethical growers worldwide.' },
];

export default function AboutPage() {
  const email = import.meta.env.VITE_BRAND_EMAIL;
  const phone = import.meta.env.VITE_BRAND_PHONE;
  const whatsapp = import.meta.env.VITE_BRAND_WHATSAPP;
  const address = import.meta.env.VITE_BRAND_ADDRESS;

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container about-hero-content">
          <p className="about-eyebrow">Our Story</p>
          <h1 className="about-title">Science Meets Nature</h1>
          <p className="about-intro">
            rhaysource was born from a simple belief: your skin deserves formulas that work with it, not against it.
            We combine cutting-edge botanical research with a commitment to transparency — every ingredient listed,
            every claim earned.
          </p>
        </div>
      </section>

      <section className="about-values py-xl">
        <div className="container">
          <div className="section-header">
            <h2>What We Stand For</h2>
            <p>The principles behind every product we make.</p>
          </div>
          <div className="values-grid">
            {values.map(v => (
              <div key={v.title} className="value-card">
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-contact py-xl" id="contact">
        <div className="container">
          <div className="contact-split">
            <div className="contact-details">
              <h2>Get in Touch</h2>
              <p className="contact-details-intro">
                Have questions about your routine or our botanical sourcing?
                Reach out to our expert formulators — we reply within 24 hours.
              </p>

              <ul className="contact-info-list">
                {email && (
                  <li>
                    <FiMail className="contact-icon" />
                    <div>
                      <span className="contact-info-label">Email</span>
                      <a href={`mailto:${email}`} className="contact-info-value">{email}</a>
                    </div>
                  </li>
                )}
                {phone && (
                  <li>
                    <FiPhone className="contact-icon" />
                    <div>
                      <span className="contact-info-label">Phone</span>
                      <a href={`tel:${phone.replace(/\D/g, '')}`} className="contact-info-value">{phone}</a>
                    </div>
                  </li>
                )}
                {whatsapp && (
                  <li>
                    <FiMessageCircle className="contact-icon" />
                    <div>
                      <span className="contact-info-label">WhatsApp</span>
                      <a
                        href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-info-value"
                      >
                        Message us on WhatsApp
                      </a>
                    </div>
                  </li>
                )}
                {address && (
                  <li>
                    <FiMapPin className="contact-icon" />
                    <div>
                      <span className="contact-info-label">Address</span>
                      <span className="contact-info-value">{address}</span>
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
