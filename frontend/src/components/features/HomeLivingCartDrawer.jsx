import React, { useEffect } from 'react';
import { FiX, FiShoppingBag, FiMinus, FiPlus, FiTrash2, FiMessageCircle, FiMail } from 'react-icons/fi';
import { useHomeLivingCart } from '../../context/HomeLivingCartContext';
import './HomeLivingCartDrawer.css';

const PLACEHOLDER_IMAGE = 'https://res.cloudinary.com/duhvgnorw/image/upload/v1776510657/rhaysource/placeholders/product-placeholder.jpg';

export default function HomeLivingCartDrawer() {
  const {
    homeCart, homeCartTotal,
    isHomeCartOpen, closeHomeCart,
    removeFromHomeCart, updateHomeQuantity, clearHomeCart,
  } = useHomeLivingCart();

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  const contactEmail   = import.meta.env.VITE_CONTACT_EMAIL;

  useEffect(() => {
    if (isHomeCartOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isHomeCartOpen]);

  const handleWhatsApp = () => {
    const lines = homeCart.map((item, i) =>
      `${i + 1}. ${item.name} (${item.quantity}x) — GH₵${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');
    const msg = `Hello RhaySource! 👋 I'd like to order the following home products:\n\n${lines}\n\nTotal: GH₵${homeCartTotal.toLocaleString()}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('New Home & Living Order — RhaySource');
    const lines = homeCart.map((item, i) =>
      `${i + 1}. ${item.name} (${item.quantity}x) — GH₵${(item.price * item.quantity).toLocaleString()}`
    ).join('\n');
    const body = encodeURIComponent(`Hello RhaySource!\n\nI'd like to order:\n\n${lines}\n\nTotal: GH₵${homeCartTotal.toLocaleString()}`);
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  if (!isHomeCartOpen) return null;

  return (
    <div className="hl-cart-overlay">
      <div className="hl-cart-backdrop" onClick={closeHomeCart} />
      <div className="hl-cart-panel">

        <div className="hl-cart-header">
          <div className="hl-cart-title">
            <FiShoppingBag /> <span>Home Bag</span>
          </div>
          <button className="hl-cart-close" onClick={closeHomeCart}><FiX /></button>
        </div>

        <div className="hl-cart-items">
          {homeCart.length === 0 ? (
            <div className="hl-cart-empty">
              <p>Your home bag is empty.</p>
              <span>Add something to get started.</span>
            </div>
          ) : (
            homeCart.map(item => (
              <div key={item.id} className="hl-cart-item">
                  <div className="item-image">
                    <img 
                      src={item.image_url || item.images?.primary || PLACEHOLDER_IMAGE} 
                      alt={item.name} 
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                  </div>
                <div className="hl-item-info">
                  <h4>{item.name}</h4>
                  <p className="hl-item-price">GH₵{item.price.toLocaleString()}</p>
                  <div className="hl-item-controls">
                    <div className="hl-qty-stepper">
                      <button onClick={() => updateHomeQuantity(item.id, item.quantity - 1)}><FiMinus /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateHomeQuantity(item.id, item.quantity + 1)}><FiPlus /></button>
                    </div>
                    <button className="hl-remove-btn" onClick={() => removeFromHomeCart(item.id)}><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {homeCart.length > 0 && (
          <div className="hl-cart-footer">
            <div className="hl-cart-total">
              <span>Subtotal</span>
              <span>GH₵{homeCartTotal.toLocaleString()}</span>
            </div>
            <div className="hl-checkout-options">
              <button className="hl-checkout-btn whatsapp" onClick={handleWhatsApp}>
                <FiMessageCircle /> Order via WhatsApp
              </button>
              <button className="hl-checkout-btn email" onClick={handleEmail}>
                <FiMail /> Request via Email
              </button>
            </div>
            <p className="hl-cart-disclaimer">Delivery arranged within 24–72 hours.</p>
            <button className="hl-clear-btn" onClick={clearHomeCart}>Clear Bag</button>
          </div>
        )}

      </div>
    </div>
  );
}
