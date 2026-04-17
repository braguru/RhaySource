import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import { toSlug } from '../../utils/slug';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <motion.article 
      className="product-card"
      whileHover={{ y: -8, boxShadow: "var(--shadow-hover)" }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/products/${toSlug(product.name)}`} className="product-card-link">
        <div className="product-image-container">
          <img src={product.images.primary} alt={product.name} className="product-image primary" />
          <img src={product.images.texture} alt={`${product.name} Texture`} className="product-image texture" />

          {product.badges && product.badges.length > 0 && (
            <div className="product-badges">
              <span className="badge">{product.badges[0]}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">
          <Link to={`/products/${toSlug(product.name)}`}>{product.name}</Link>
        </h3>
        <p className="product-price">GH₵{product.price.toFixed(2)}</p>
        <Button 
          variant="secondary" 
          className="add-to-bag-btn"
          onClick={handleAddToCart}
        >
          Add to Bag
        </Button>
      </div>
    </motion.article>
  );
};

export default ProductCard;
