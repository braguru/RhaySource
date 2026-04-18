import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiShield, FiUsers } from 'react-icons/fi';
import ContactForm from '../components/features/ContactForm';
import './WorkspaceAboutPage.css';

const values = [
  {
    icon: <FiCpu />,
    title: 'Performance First',
    description: 'Every machine in our catalog is benchmarked and vetted for real-world professional workloads — no compromises on processing power or reliability.',
  },
  {
    icon: <FiShield />,
    title: 'Authentic & Warranted',
    description: '100% genuine products sourced directly from authorised distributors, with full manufacturer warranties honoured.',
  },
  {
    icon: <FiUsers />,
    title: 'Expert Consultation',
    description: 'Our tech specialists help you match the right workstation to your workflow — from creative studios to enterprise deployments.',
  },
];

export default function WorkspaceAboutPage() {
  return (
    <div className="wsa-page">
      <section className="wsa-hero">
        <div className="container wsa-hero-content">
          <motion.p className="wsa-eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Our Philosophy
          </motion.p>
          <motion.h1 className="wsa-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            Built for Those <br /> Who Build Things
          </motion.h1>
          <motion.p className="wsa-intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            RhaySource Workspace was born from one conviction: the right tools change everything.
            We curate professional-grade workstations so that creators, developers, and enterprise
            teams can focus on their work — not their hardware.
          </motion.p>
        </div>
      </section>

      <section className="wsa-vision">
        <div className="container">
          <div className="wsa-vision-grid">
            <div className="wsa-vision-text">
              <h2 className="wsa-accent-heading">Why Workspace?</h2>
              <p>We saw a gap. Premium computing hardware was either inaccessible, poorly supported, or sold without the expertise buyers needed to make confident decisions.</p>
              <p>RhaySource Workspace closes that gap. We bring enterprise-grade machines — laptops, desktops, and accessories — with honest specs, real pricing in GH₵, and a team that understands what every spec actually means for your work.</p>
            </div>
            <div className="wsa-stat-card">
              <div className="wsa-stat-item">
                <span className="wsa-stat-number">100%</span>
                <span className="wsa-stat-label">Verified Authentic</span>
              </div>
              <div className="wsa-stat-item">
                <span className="wsa-stat-number">GH₵</span>
                <span className="wsa-stat-label">Transparent Local Pricing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="wsa-values">
        <div className="container">
          <div className="wsa-section-header">
            <h2>What We Stand For</h2>
            <p>The principles behind every workstation we sell.</p>
          </div>
          <div className="wsa-values-grid">
            {values.map((v, i) => (
              <motion.div key={v.title} className="wsa-value-card" initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <div className="wsa-value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="wsa-contact" id="contact">
        <div className="container">
          <div className="wsa-contact-split">
            <div className="wsa-contact-details">
              <h2>Talk to a Specialist</h2>
              <p>Not sure which workstation fits your workflow? Our tech team is ready to guide you through specs, budgets, and deployment — reach out any time.</p>
            </div>
            <ContactForm dark />
          </div>
        </div>
      </section>
    </div>
  );
}
