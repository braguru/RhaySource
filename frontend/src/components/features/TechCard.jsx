import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toSlug } from '../../utils/slug';
import './TechCard.css';

const TechCard = ({ product }) => {
  // Ensure we have a valid slug or ID for the link
  const productSlug = product.slug || (product.name ? toSlug(product.name) : product.id);
  const linkPath = `/workspace/products/${productSlug}`;
  
  // Format price - checking if it's already a number
  const price = Number(product.price);
  const formattedPrice = !isNaN(price) 
    ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : product.price;

  // Extract category name (handle both string and object)
  const categoryName = typeof product.category === 'object' 
    ? product.category?.name 
    : (product.category || 'Technology');

  const mainImage = product.image_url || product.images?.primary;

  return (
    <motion.div 
      className="tech-card"
      whileHover={{ y: -10 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={linkPath} className="tech-card-link">
        <div className="tech-card-image-wrapper">
          <img 
            src={mainImage} 
            alt={product.name} 
            className="tech-card-image"
            loading="lazy"
          />
        </div>
        <div className="tech-card-content">
          <div className="tech-card-meta">
            <span className="tech-card-category">{categoryName}</span>
            {product.brand && <span className="tech-card-brand">{product.brand}</span>}
          </div>
          <h3 className="tech-card-name">{product.name}</h3>
          <p className="tech-card-price">GH₵ {formattedPrice}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default TechCard;
