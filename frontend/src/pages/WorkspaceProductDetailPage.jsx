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
  processor: <FiCpu />,
  cpu:       <FiCpu />,
  memory:    <FiLayers />,
  ram:       <FiLayers />,
  storage:   <FiHardDrive />,
  display:   <FiMonitor />,
  gpu:       <FiCpu style={{ color: '#10b981' }} />, 
  os:        <FiMonitor style={{ color: '#0ea5e9' }} />, 
  weight:    <FiLayers style={{ color: '#6366f1' }} />, 
};

const SPEC_LABELS = {
  processor: 'Processor',
  cpu:       'Processor',
  memory:    'Memory',
  ram:       'Memory',
  storage:   'Storage',
  display:   'Display',
  gpu:       'Graphics',
  os:        'Operating System',
  weight:    'Weight',
};

export default function WorkspaceProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(id);
  const { products: allTechProducts } = useProducts('workspace');
  const { addToTechCart } = useTechCart();

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
  const whatsappMsg = encodeURIComponent(`Hi RhaySource, I'm interested in the ${product.name}. Please share availability.`);
  const whatsappHref = `https://wa.me/${WHATSAPP}?text=${whatsappMsg}`;

  return (
    <div className="workspace-page">
      <div className="container">
        <button className="wpdp-back-link" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div className="wpdp-grid">
          <motion.div className="wpdp-image-panel" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="tech-detail-image"><img src={mainImage} alt={product.name} /></div>
            <div className="wpdp-category-pill">
              {typeof product.category === 'object' ? product.category?.name : product.category}
            </div>
          </motion.div>

          <motion.div className="wpdp-info-panel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="wpdp-brand">{product.brand}</p>
            <h1 className="wpdp-name">{product.name}</h1>
            <p className="wpdp-price">GH₵{product.price?.toLocaleString()}</p>
            <p className="wpdp-description">{product.description}</p>

            <div className="wpdp-specs-block">
              <h2 className="wpdp-specs-title">Technical Specifications</h2>
              <div className="wpdp-specs-table">
                {(() => {
                  const raw = product.specs || {};
                  
                  // DETECT NESTED DATA ISSUES:
                  // Some products have a nested 'specs' object with incorrect placeholder data (e.g. M4 Max on a Dell).
                  // We prioritize the top-level keys (processor, memory, storage, display) over the nested ones.
                  const displaySpecs = {
                    // Start with nested specs if they exist (lowest priority)
                    ...(raw.specs && typeof raw.specs === 'object' ? raw.specs : {}),
                    // Overwrite with top-level keys (highest priority)
                    ...raw
                  };

                  // Filter out metadata and the nested object itself
                  const filteredEntries = Object.entries(displaySpecs)
                    .filter(([key, val]) => 
                      !['specs', 'brand', 'store_slug', 'id', 'created_at'].includes(key) && 
                      val !== null && val !== ''
                    );

                  // Deduplicate by Label (e.g., if both 'cpu' and 'processor' exist, only show one)
                  const uniqueSpecs = {};
                  filteredEntries.forEach(([key, val]) => {
                    const label = SPEC_LABELS[key] || key;
                    // We prioritize the new labels (processor/memory) over the old ones (cpu/ram) if both are present
                    if (!uniqueSpecs[label] || ['processor', 'memory', 'storage', 'display'].includes(key)) {
                      uniqueSpecs[label] = { key, val };
                    }
                  });

                  return Object.entries(uniqueSpecs).map(([label, { key, val }]) => (
                    <div key={label} className="wpdp-spec-row">
                      <div className="wpdp-spec-label">
                        {SPEC_ICONS[key] || <FiCpu />}
                        <span>{label}</span>
                      </div>
                      <div className="wpdp-spec-value">
                        {typeof val === 'object' ? JSON.stringify(val) : val}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="wpdp-actions">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="wpdp-whatsapp-btn"><FiMessageSquare /> Order via WhatsApp</a>
              <button className="wpdp-cart-btn" onClick={() => addToTechCart(product)}>Add to Workspace Bag</button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
