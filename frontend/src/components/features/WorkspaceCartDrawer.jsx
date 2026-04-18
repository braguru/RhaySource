import React, { useEffect } from 'react';
import { FiX, FiShoppingCart, FiMinus, FiPlus, FiTrash2, FiMessageCircle, FiMail } from 'react-icons/fi';
import { useTechCart } from '../../context/TechCartContext';
import './WorkspaceCartDrawer.css';

export default function WorkspaceCartDrawer() {
  const {
    techCart,
    techCartTotal,
    isTechCartOpen,
    closeTechCart,
    removeFromTechCart,
    updateTechQuantity,
    clearTechCart
  } = useTechCart();

  useEffect(() => {
    const html = document.documentElement;
    if (isTechCartOpen) {
      document.body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      html.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      html.style.overflow = '';
    };
  }, [isTechCartOpen]);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL;

  const handleWhatsAppCheckout = () => {
    const message = `Hello RhaySource! 👋 I'm interested in ordering the following workspace items:\n\n${techCart.map((item, i) => `${i + 1}. ${item.name} (${item.quantity}x) - GH₵${(item.price * item.quantity).toLocaleString()}`).join('\n')}\n\nTotal Estimate: GH₵${techCartTotal.toLocaleString()}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEmailCheckout = () => {
    const subject = encodeURIComponent("New Workspace Order Inquiry - RhaySource");
    const body = encodeURIComponent(`Hello RhaySource!\n\nI'm interested in ordering the following workspace items:\n\n${techCart.map((item, i) => `${i + 1}. ${item.name} (${item.quantity}x) - GH₵${(item.price * item.quantity).toLocaleString()}`).join('\n')}\n\nTotal Estimate: GH₵${techCartTotal.toLocaleString()}`);
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
  };

  if (!isTechCartOpen) return null;

  return (
    <div className="tech-cart-overlay">
      <div className="tech-cart-backdrop" onClick={closeTechCart} />
      <div className="tech-cart-sideboard">
        <div className="tech-cart-header">
          <div className="tech-cart-title">
            <FiShoppingCart /> <span>Workspace Bag</span>
          </div>
          <button className="tech-close-btn" onClick={closeTechCart}><FiX /></button>
        </div>

        <div className="tech-cart-items">
          {techCart.length === 0 ? (
            <div className="tech-empty-state">
              <p>Your workspace is empty.</p>
              <span>Add a tool to begin your journey.</span>
            </div>
          ) : (
            techCart.map(item => (
              <div key={item.id} className="tech-cart-item">
                <img src={item.images.primary} alt={item.name} />
                <div className="tech-item-info">
                  <h4>{item.name}</h4>
                  <p className="tech-item-price">GH₵{item.price.toLocaleString()}</p>
                  <div className="tech-item-controls">
                    <div className="quantity-stepper">
                      <button onClick={() => updateTechQuantity(item.id, item.quantity - 1)}><FiMinus /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateTechQuantity(item.id, item.quantity + 1)}><FiPlus /></button>
                    </div>
                    <button className="tech-remove-btn" onClick={() => removeFromTechCart(item.id)}><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {techCart.length > 0 && (
          <div className="tech-cart-footer">
            <div className="tech-total-row">
              <span>Subtotal</span>
              <span>GH₵{techCartTotal.toLocaleString()}</span>
            </div>
            <div className="tech-checkout-options">
              <button className="tech-checkout-btn whatsapp" onClick={handleWhatsAppCheckout}>
                <FiMessageCircle /> Order via WhatsApp
              </button>
              <button className="tech-checkout-btn email" onClick={handleEmailCheckout}>
                <FiMail /> Request vía Email
              </button>
            </div>
            <p className="tech-footer-disclaimer">Expert workstations delivered within 24-48 hours.</p>
            <button className="tech-clear-btn" onClick={clearTechCart}>Clear Selection</button>
          </div>
        )}
      </div>
    </div>
  );
}
