import React, { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';

/**
 * StudioToast - A premium, non-blocking notification component for administrative feedback.
 */
export default function StudioToast({ message, type = 'success', isOpen, onClose, duration = 4000 }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div style={{
      position: 'fixed',
      top: '2rem',
      right: '2rem',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem 1.5rem',
      background: '#ffffff',
      border: `1px solid ${isSuccess ? '#dcfce7' : '#fee2e2'}`,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      borderRadius: '12px',
      minWidth: '320px',
      animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{ 
        color: isSuccess ? '#22c55e' : '#ef4444',
        display: 'flex',
        alignItems: 'center'
      }}>
        {isSuccess ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
      </div>
      
      <div style={{ flexGrow: 1 }}>
        <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1a1a1b', letterSpacing: '-0.01em' }}>
          {isSuccess ? 'Action Successful' : 'Action Failed'}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
          {message}
        </div>
      </div>

      <button 
        onClick={onClose}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: '#94a3b8', 
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.2s ease'
        }}
        onMouseOver={e => e.currentTarget.style.color = '#1a1a1b'}
        onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
      >
        <FiX size={16} />
      </button>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
