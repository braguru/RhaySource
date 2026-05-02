import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import Button from '../ui/Button';
import { toSlug } from '../../utils/slug';
import { useCart } from '../../context/CartContext';
import { useTechCart } from '../../context/TechCartContext';
import { useHomeLivingCart } from '../../context/HomeLivingCartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToTechCart } = useTechCart();
  const { addToHomeCart } = useHomeLivingCart();
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const storeSlug = product.stores?.slug || product.store_slug;
    
    if (storeSlug === 'workspace') {
      addToTechCart(product);
    } else if (storeSlug === 'home-living') {
      addToHomeCart(product);
    } else {
      addToCart(product);
    }
  };

  const mainImage = product.image_url || (product.images && product.images.primary);
  const productSlug = product.slug || (product.name ? toSlug(product.name) : product.id);
  
  const getLinkPath = () => {
    const storeSlug = product.stores?.slug;
    if (storeSlug === 'workspace') return `/workspace/products/${productSlug}`;
    if (storeSlug === 'home-living') return `/home-living/products/${productSlug}`;
    return `/products/${productSlug}`;
  };

  const linkPath = getLinkPath();

  return (
    <motion.article 
      className="modern-product-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link to={linkPath} className="card-image-link">
        <div className="card-image-wrapper">
          <img src={mainImage} alt={product.name} className="card-main-image" />
          <div className="card-image-overlay">
            <FiSearch className="search-icon-overlay" />
          </div>
          
          {product.is_featured && (
            <div className="card-badge top-badge">Best Seller</div>
          )}
        </div>
      </Link>

      <div className="card-details">
        <h3 className="card-title">
          <Link to={linkPath}>{product.name}</Link>
        </h3>
        
        <p className="card-subtitle">
          {product.brand || (typeof product.category === 'object' ? product.category?.name : product.category)}
        </p>

        <div className="card-footer-row">
          <div className="footer-left">
            <div className="card-actions">
              <Button 
                variant="primary" 
                className="action-btn-modern"
                onClick={handleAddToCart}
              >
                {product.stores?.slug === 'workspace' ? 'EQUIP' : 'ADD TO BAG'}
              </Button>
            </div>
          </div>

          <div className="footer-right">
            <span className="card-currency">GH₵</span>
            <span className="card-price-value">
              {Math.floor(product.price)}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ProductCard;


