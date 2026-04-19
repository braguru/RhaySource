import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCpu, FiLayers, FiHardDrive, FiMonitor, FiMessageSquare } from 'react-icons/fi';
import { useProduct, useProducts } from '../hooks/useProducts';
import ProductDetailSkeleton from '../components/features/skeletons/ProductDetailSkeleton';
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
  const { product, loading, error } = useProduct(id);
  const { products: allTechProducts } = useProducts('workspace');
  const { addToTechCart } = useTechCart();

  // Define related products based on category
  const related = allTechProducts.filter(p => 
    p.category === product?.category && p.id !== product?.id
  ).slice(0, 4);

  if (loading) return <ProductDetailSkeleton />;
  if (error || !product) {
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

  const mainImage = product.image_url || (product.images && product.images.primary);

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
            <div className="tech-detail-image">
              <img src={mainImage} alt={product.name} />
            </div>
            <div className="wpdp-category-pill">
              {typeof product.category === 'object' ? (product.category?.name || 'Workspace') : product.category}
            </div>
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
                {(() => {
                  const rawSpecs = product.specs || {};
                  // If specs contains a nested specs object, use that (fixes data structure bugs)
                  const displaySpecs = rawSpecs.specs && typeof rawSpecs.specs === 'object' ? rawSpecs.specs : rawSpecs;
                  
                  return Object.entries(displaySpecs)
                    .filter(([key]) => !['brand', 'store_slug', 'id', 'created_at'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="wpdp-spec-row">
                        <div className="wpdp-spec-label">
                          {SPEC_ICONS[key]}
                          <span>{SPEC_LABELS[key] || key}</span>
                        </div>
                        <div className="wpdp-spec-value">
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </div>
                      </div>
                    ));
                })()}
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
        {related && related.length > 0 && (
          <section className="wpdp-related">
            <h2 className="wpdp-related-title">More in <span>{typeof product.category === 'object' ? (product.category?.name || 'Collection') : product.category}</span></h2>
            <div className="wpdp-related-grid">
              {related.map(p => (
                <Link key={p.id} to={`/workspace/products/${p.id}`} className="wpdp-related-card">
                  <div className="related-product-image">
                    <img 
                      src={p.image_url || p.images?.primary || 'https://res.cloudinary.com/duhvgnorw/image/upload/v1776510657/rhaysource/placeholders/product-placeholder.jpg'} 
                      alt={p.name} 
                      onError={(e) => { e.target.src = 'https://res.cloudinary.com/duhvgnorw/image/upload/v1776510657/rhaysource/placeholders/product-placeholder.jpg'; }}
                    />
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
