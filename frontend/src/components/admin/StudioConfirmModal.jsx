import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const StudioConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  productName, 
  productImage,
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  type = "danger" 
}) => {
  if (!isOpen) return null;

  const accentColor = type === "danger" ? "#ef4444" : "var(--studio-accent)";

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        />

        {/* Modal Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{ 
            position: 'relative', 
            background: '#ffffff', 
            width: '100%', 
            maxWidth: '440px', 
            borderRadius: '16px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            border: '1px solid var(--studio-border)'
          }}
        >
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: type === "danger" ? '#fff1f2' : 'rgba(254, 187, 0, 0.1)', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                color: accentColor
              }}>
                <FiAlertTriangle size={24} />
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--studio-text-muted)', cursor: 'pointer' }}>
                <FiX size={20} />
              </button>
            </div>

            <h3 className="studio-title" style={{ fontSize: '1.25rem', marginBottom: '1rem', margin: 0 }}>{title}</h3>
            
            {/* Visual Context */}
            {(productImage || productName) && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                padding: '1rem', 
                background: '#f8fafc', 
                borderRadius: '12px', 
                marginBottom: '1.5rem',
                border: '1px solid var(--studio-border)'
              }}>
                {productImage && (
                  <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#fff' }}>
                    <img src={productImage} alt={productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--studio-text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {productName}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--studio-text-muted)', marginTop: '2px' }}>
                    Action: Permanent Removal
                  </p>
                </div>
              </div>
            )}

            <p style={{ color: 'var(--studio-text-muted)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
              {message}
            </p>
          </div>

          <div style={{ padding: '1.5rem 2rem', background: '#f8fafc', borderTop: '1px solid var(--studio-border)', display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={onClose}
              style={{ 
                flex: 1, 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: '1px solid var(--studio-border)', 
                background: '#ffffff',
                color: 'var(--studio-text)',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              style={{ 
                flex: 1, 
                padding: '0.75rem', 
                borderRadius: '8px', 
                border: 'none', 
                background: accentColor,
                color: type === "danger" ? '#ffffff' : '#000000',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StudioConfirmModal;
