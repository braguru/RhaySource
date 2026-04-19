import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiMinus, FiPlus } from 'react-icons/fi';
import Button from '../components/ui/Button';
import ProductCard from '../components/features/ProductCard';
import { useProduct } from '../hooks/useProducts';
import ProductDetailSkeleton from '../components/features/skeletons/ProductDetailSkeleton';
import { useCart } from '../context/CartContext';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(slug);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (loading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <div className="container product-not-found">
        <p>Product not found.</p>
        <Link to="/shop" className="back-link"><FiArrowLeft /> Back to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const mainImage = product.image_url || (product.images && product.images.primary);
  const details = product.specs || {};
  
  // Prevent crash from undefined variables
  const related = []; 
  const keyIngredients = product.keyIngredients || details.keyIngredients || [];
  const usageInstructions = product.usageInstructions || details.usageInstructions || 'No instructions provided.';
  const skinType = product.skinType || details.skinType || [];

  return (
    <div className="product-detail-page">
      <div className="container">
        <button className="back-link" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div className="product-detail-grid">
          <div className="product-detail-images">
            <div className="product-detail-image-wrap">
              <img src={mainImage} alt={product.name} />
            </div>
          </div>

          <div className="product-detail-info">
            <p className="product-detail-category">
              {typeof (product.categories?.name || product.category) === 'object' 
                ? 'Collection' 
                : (product.categories?.name || product.category || 'Collection')}
            </p>
            <h1 className="product-detail-name">{product.name}</h1>
            <p className="product-detail-price">GH₵{Number(product.price).toFixed(2)}</p>

            <div className="tab-content fade-in">
              <p>{product.description}</p>
              {details.skinType && (
                <div className="spec-item mt-md">
                  <strong>Target Skin Type:</strong> {Array.isArray(details.skinType) ? details.skinType.join(', ') : details.skinType}
                </div>
              )}
            </div>

            <div className="product-detail-meta">
              {keyIngredients.length > 0 && (
                <div className="meta-section">
                  <h3>Key Ingredients</h3>
                  <ul className="ingredient-list">
                    {keyIngredients.map(ing => (
                      <li key={ing}>
                        <FiCheckCircle className="check-icon" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="meta-section">
                <h3>How to Use</h3>
                <p className="usage-text">{usageInstructions}</p>
              </div>

              {skinType.length > 0 && (
                <div className="meta-section">
                  <h3>Good For</h3>
                  <div className="skin-type-tags">
                    {(Array.isArray(skinType) ? skinType : [skinType]).map(type => (
                      <Link
                        key={type}
                        to={`/shop?concern=${type === 'All' ? '' : encodeURIComponent(type)}`}
                        className="skin-type-tag"
                      >
                        {type}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="product-detail-actions">
              <Button 
                variant="primary" 
                className="add-to-bag-full"
                onClick={handleAddToCart}
              >
                Add to Bag — GH₵{Number(product.price).toFixed(2)}
              </Button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="related-products">
            <div className="section-header">
              <h2>You May Also Like</h2>
            </div>
            <div className="product-grid">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
