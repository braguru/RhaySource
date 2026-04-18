import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return createPortal(
    <AnimatePresence>
      {message && (
        <motion.div
          className={`toast toast-${type}`}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <span className="toast-icon">
            {type === 'success' ? <FiCheckCircle /> : <FiXCircle />}
          </span>
          <p className="toast-message">{message}</p>
          <button className="toast-close" onClick={onClose} aria-label="Dismiss">
            <FiX />
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Toast;
