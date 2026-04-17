import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingBag, FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, cartCount } = useCart();

  useEffect(() => {
    const html = document.documentElement;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      html.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      html.style.overflow = 'unset';
    };
  }, [isOpen]);

  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL;

  const generateOrderMessage = () => {
    let message = "Hello RhaySource! 👋 I'm interested in ordering the following items:\n\n";
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.name} (${item.quantity}x) - GH₵${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\nTotal Estimate: GH₵${cartTotal.toFixed(2)}`;
    return encodeURIComponent(message);
  };

  const handleWhatsAppOrder = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${generateOrderMessage()}`;
    window.open(url, '_blank');
  };

  const handleEmailOrder = () => {
    const subject = encodeURIComponent("New Order Inquiry - RhaySource");
    const body = generateOrderMessage();
    const url = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    window.location.href = url;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="cart-drawer glass"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="cart-header">
              <div className="cart-title">
                <FiShoppingBag />
                <h2>Your Selection</h2>
                <span className="cart-count-badge">{cartCount}</span>
              </div>
              <button className="close-drawer" onClick={onClose}>
                <FiX />
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-icon">🌿</div>
                  <h3>Your bag is empty</h3>
                  <p>Start exploring our botanical solutions to find your perfect match.</p>
                  <button className="btn btn-primary" onClick={onClose}>
                    Explore Shop
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <img src={item.images.primary} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <div className="item-row">
                        <h4>{item.name}</h4>
                        <button 
                          className="remove-item" 
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                      <p className="item-price">GH₵{item.price.toFixed(2)}</p>
                      <div className="item-qty">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <FiMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <FiPlus />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span className="total-amount">GH₵{cartTotal.toFixed(2)}</span>
                  </div>
                  <p className="summary-note">Pricing excludes shipping. Final details via WhatsApp/Email.</p>
                </div>

                <div className="cart-actions">
                  <button className="whatsapp-btn" onClick={handleWhatsAppOrder}>
                    <span>Order via WhatsApp</span>
                    <FiArrowRight />
                  </button>
                  <button className="email-btn" onClick={handleEmailOrder}>
                    <span>Order via Email</span>
                  </button>
                  <button className="clear-cart-btn" onClick={clearCart}>
                    Clear Selection
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
