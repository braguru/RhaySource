import React from 'react';
import Button from '../ui/Button';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <article className="product-card">
      <div className="product-image-container">
        <img src={product.images.primary} alt={product.name} className="product-image primary" />
        <img src={product.images.texture} alt={`${product.name} Texture`} className="product-image texture" />
        
        {product.badges && product.badges.length > 0 && (
          <div className="product-badges">
            <span className="badge">{product.badges[0]}</span>
          </div>
        )}
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <Button variant="secondary" className="add-to-bag-btn">Add to Bag</Button>
      </div>
    </article>
  );
};

export default ProductCard;
