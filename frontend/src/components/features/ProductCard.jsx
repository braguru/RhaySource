import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    
    // Check stores object (from join) or direct field
    const storeSlug = product.stores?.slug || product.store_slug;
    
    if (storeSlug === 'workspace') {
      addToTechCart(product);
    } else if (storeSlug === 'home-living') {
      addToHomeCart(product);
    } else {
      addToCart(product);
    }
  };

  // 1. Image & Slug Handling
  const mainImage = product.image_url || (product.images && product.images.primary);
  const textureImage = product.images && product.images.texture;
  const productSlug = product.slug || (product.name ? toSlug(product.name) : product.id);
  const hasTexture = textureImage && textureImage !== mainImage;

  // 2. Intelligent Routing (Dynamic store-based paths)
  const getLinkPath = () => {
    const storeSlug = product.stores?.slug;
    if (storeSlug === 'workspace') return `/workspace/products/${productSlug}`;
    if (storeSlug === 'home-living') return `/home-living/products/${productSlug}`;
    return `/products/${productSlug}`;
  };

  const linkPath = getLinkPath();

  return (
    <motion.article 
      className="product-card"
      whileHover={{ y: -8, boxShadow: "var(--shadow-hover)" }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <Link to={linkPath} className="product-card-link">
        <div className={`product-image-container ${hasTexture ? 'has-texture' : ''}`}>
          <img src={mainImage} alt={product.name} className="product-image primary" />
          {hasTexture && <img src={textureImage} alt={`${product.name} Texture`} className="product-image texture" />}

          {product.badges && product.badges.length > 0 && (
            <div className="product-badges">
              <span className="badge">{product.badges[0]}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="product-info">
        <p className="product-category">
          {typeof product.category === 'object' ? (product.category?.name || 'Collection') : product.category}
        </p>
        <h3 className="product-name">
          <Link to={linkPath}>{product.name}</Link>
        </h3>
        <p className="product-price">GH₵{Number(product.price).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</p>
        <Button 
          variant="secondary" 
          className="add-to-bag-btn"
          onClick={handleAddToCart}
        >
          {product.stores?.slug === 'workspace' ? 'Equip Workspace' : 
           product.stores?.slug === 'home-living' ? 'Add to Cart' : 
           'Add to Bag'}
        </Button>
      </div>
    </motion.article>
  );
};

export default ProductCard;
