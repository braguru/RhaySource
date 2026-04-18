import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCpu, FiHardDrive, FiMonitor, FiMessageSquare, FiLayers } from 'react-icons/fi';
import techProducts from '../data/tech-products.json';
import { useTechCart } from '../context/TechCartContext';
import './WorkspacePage.css';
import './WorkspaceProductDetailPage.css';

const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER;

const SPEC_ICONS = {
  cpu:     <FiCpu />,
  ram:     <FiLayers />,
  storage: <FiHardDrive />,
  display: <FiMonitor />,
};

const SPEC_LABELS = {
  cpu:     'Processor',
  ram:     'Memory',
  storage: 'Storage',
  display: 'Display',
};

export default function WorkspaceProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToTechCart } = useTechCart();
  const { products } = techProducts;

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="workspace-page">
        <div className="container wpdp-not-found">
          <p>Product not found.</p>
          <Link to="/workspace/shop" className="wpdp-back-link">
            <FiArrowLeft /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const related = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  const whatsappMsg = encodeURIComponent(
    `Hi RhaySource, I'm interested in the ${product.name} (${product.id}). Please share availability and pricing.`
  );
  const whatsappHref = `https://wa.me/${WHATSAPP}?text=${whatsappMsg}`;

  return (
    <div className="workspace-page">
      <div className="container">
        <button className="wpdp-back-link" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div className="wpdp-grid">
          {/* Image Panel */}
          <motion.div
            className="wpdp-image-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="wpdp-image-wrap">
              <img src={product.images.primary} alt={product.name} />
            </div>
            <div className="wpdp-category-pill">{product.category}</div>
          </motion.div>

          {/* Info Panel */}
          <motion.div
            className="wpdp-info-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="wpdp-brand">{product.brand}</p>
            <h1 className="wpdp-name">{product.name}</h1>
            <p className="wpdp-price">GH₵{product.price.toLocaleString()}</p>

            <p className="wpdp-description">{product.description}</p>

            {/* Specs Table */}
            <div className="wpdp-specs-block">
              <h2 className="wpdp-specs-title">Technical Specifications</h2>
              <div className="wpdp-specs-table">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="wpdp-spec-row">
                    <div className="wpdp-spec-label">
                      {SPEC_ICONS[key]}
                      <span>{SPEC_LABELS[key] || key}</span>
                    </div>
                    <div className="wpdp-spec-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="wpdp-actions">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="wpdp-whatsapp-btn"
              >
                <FiMessageSquare />
                Order via WhatsApp
              </a>
              <button
                className="wpdp-cart-btn"
                onClick={() => addToTechCart(product)}
              >
                Add to Workspace Bag
              </button>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="wpdp-related">
            <h2 className="wpdp-related-title">More in <span>{product.category}</span></h2>
            <div className="wpdp-related-grid">
              {related.map(p => (
                <Link key={p.id} to={`/workspace/products/${p.id}`} className="wpdp-related-card">
                  <div className="wpdp-related-image">
                    <img src={p.images.primary} alt={p.name} />
                  </div>
                  <div className="wpdp-related-info">
                    <p className="wpdp-related-brand">{p.brand}</p>
                    <p className="wpdp-related-name">{p.name}</p>
                    <p className="wpdp-related-price">GH₵{p.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
