import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import Button from '../components/ui/Button';
import ProductCard from '../components/features/ProductCard';
import productsData from '../data/products.json';
import { findBySlug, toSlug } from '../utils/slug';
import { useCart } from '../context/CartContext';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { products } = productsData;
  const product = findBySlug(slug, products);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  if (!product) {
    return (
      <div className="container product-not-found">
        <p>Product not found.</p>
        <Link to="/shop" className="back-link"><FiArrowLeft /> Back to Shop</Link>
      </div>
    );
  }

  const related = products
    .filter(p => p.id !== product.id && (
      p.category === product.category ||
      p.skinType.some(t => product.skinType.includes(t))
    ))
    .slice(0, 3);

  return (
    <div className="product-detail-page">
      <div className="container">
        <button className="back-link" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div className="product-detail-grid">
          <div className="product-detail-images">
            <div className="product-detail-image-wrap">
              <img src={product.images.primary} alt={product.name} />
            </div>
          </div>

          <div className="product-detail-info">
            <p className="product-detail-category">{product.category}</p>
            <h1 className="product-detail-name">{product.name}</h1>
            <p className="product-detail-price">GH₵{product.price.toFixed(2)}</p>

            {product.badges && product.badges.length > 0 && (
              <div className="product-detail-badges">
                {product.badges.map(badge => (
                  <span key={badge} className="badge">{badge}</span>
                ))}
              </div>
            )}

            <p className="product-detail-description">{product.description}</p>

            <div className="product-detail-meta">
              <div className="meta-section">
                <h3>Key Ingredients</h3>
                <ul className="ingredient-list">
                  {product.keyIngredients.map(ing => (
                    <li key={ing}>
                      <FiCheckCircle className="check-icon" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="meta-section">
                <h3>How to Use</h3>
                <p className="usage-text">{product.usageInstructions}</p>
              </div>

              <div className="meta-section">
                <h3>Good For</h3>
                <div className="skin-type-tags">
                  {product.skinType.map(type => (
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
            </div>

            <div className="product-detail-actions">
              <Button 
                variant="primary" 
                className="add-to-bag-full"
                onClick={handleAddToCart}
              >
                Add to Bag — GH₵{product.price.toFixed(2)}
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
