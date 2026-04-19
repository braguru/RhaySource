import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import { useProduct, useProducts } from '../hooks/useProducts';
import ProductDetailSkeleton from '../components/features/skeletons/ProductDetailSkeleton';
import { useHomeLivingCart } from '../context/HomeLivingCartContext';
import './HomeLivingPage.css';
import './HomeLivingProductDetailPage.css';

const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER;

export default function HomeLivingProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(id);
  const { products: allProducts, loading: loadingRelated } = useProducts('home-living');
  const { addToHomeCart } = useHomeLivingCart();

  if (loading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <div className="hl-page">
        <div className="container hlpdp-not-found">
          <p>Product not found.</p>
          <Link to="/home-living/shop" className="hlpdp-back">
            <FiArrowLeft /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const related = allProducts
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  const whatsappMsg = encodeURIComponent(
    `Hi RhaySource! I'm interested in the ${product.name} by ${product.brand} (${product.id}). Please share availability and pricing.`
  );
  const whatsappHref = `https://wa.me/${WHATSAPP}?text=${whatsappMsg}`;

  return (
    <div className="hl-page">
      <div className="container">

        <button className="hlpdp-back" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div className="hlpdp-grid">
          {/* Image */}
          <motion.div
            className="hlpdp-image-panel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="hlpdp-image-wrap">
              <img src={product.image_url || (product.images && product.images.primary)} alt={product.name} />
            </div>
            <div className="hlpdp-cat-pill">
              {typeof product.category === 'object' ? (product.category?.name || 'Home & Living') : product.category}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            className="hlpdp-info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="hlpdp-brand">{product.brand}</p>
            <h1 className="hlpdp-name">{product.name}</h1>
            <p className="hlpdp-price">GH₵{Number(product.price).toLocaleString()}</p>
            <p className="hlpdp-desc">{product.description}</p>

            <div className="hlpdp-specs-block">
              <h2 className="hlpdp-specs-title">Product Details</h2>
              <div className="hlpdp-specs-table">
                {(() => {
                  const rawSpecs = product.specs || {};
                  // Flatten if nested
                  const displaySpecs = rawSpecs.specs && typeof rawSpecs.specs === 'object' ? rawSpecs.specs : rawSpecs;
                  
                  return Object.entries(displaySpecs)
                    .filter(([key]) => !['brand', 'store_slug', 'id', 'created_at'].includes(key))
                    .map(([key, value]) => {
                      // Formatting key: camelCase to Title Case
                      const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      
                      return (
                        <div key={key} className="hlpdp-spec-row">
                          <span className="hlpdp-spec-key">{formattedKey}</span>
                          <span className="hlpdp-spec-val">
                            {typeof value === 'object' ? JSON.stringify(value) : value}
                          </span>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>

            <div className="hlpdp-actions">
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="hlpdp-whatsapp-btn">
                <FiMessageSquare />
                Order via WhatsApp
              </a>
              <button className="hlpdp-cart-btn" onClick={() => addToHomeCart(product)}>
                Add to Home Bag
              </button>
            </div>
          </motion.div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="hlpdp-related">
            <h2 className="hlpdp-related-title">More in <span>{typeof product.category === 'object' ? (product.category?.name || 'Collection') : product.category}</span></h2>
            <div className="hlpdp-related-grid">
              {related.map(p => (
                <Link key={p.id} to={`/home-living/products/${p.slug || p.id}`} className="hlpdp-related-card">
                  <div className="hlpdp-related-img">
                    <img src={p.image_url || (p.images && p.images.primary)} alt={p.name} />
                  </div>
                  <div className="hlpdp-related-info">
                    <p className="hlpdp-related-brand">{p.brand}</p>
                    <p className="hlpdp-related-name">{p.name}</p>
                    <p className="hlpdp-related-price">GH₵{Number(p.price).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</p>
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
