import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';
import './NotificationToast.css';

const PLACEHOLDER_IMAGE = 'https://res.cloudinary.com/duhvgnorw/image/upload/v1776510657/rhaysource/placeholders/product-placeholder.jpg';

const NotificationToast = ({ notification }) => {
    const { removeNotification } = useNotification();
    const { id, title, message, image, type, onCloseCart } = notification;

    return (
        <motion.div
            className="notification-toast"
            data-type={type}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            layout
        >
            <div className="toast-image">
                <img 
                    src={image || PLACEHOLDER_IMAGE} 
                    alt={title} 
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                />
            </div>
            <div className="toast-content">
                <p className="toast-title">{title}</p>
                <p className="toast-message">{message}</p>
                <div className="toast-actions">
                    <button 
                        className="toast-btn" 
                        onClick={() => {
                            if (onCloseCart) onCloseCart();
                            removeNotification(id);
                        }}
                    >
                        View
                    </button>
                    <button className="toast-btn" onClick={() => removeNotification(id)}>Dismiss</button>
                </div>
            </div>
        </motion.div>
    );
};

export const NotificationToastContainer = () => {
    const { notifications } = useNotification();

    return (
        <div className="notification-container">
            <AnimatePresence>
                {notifications.map((n) => (
                    <NotificationToast key={n.id} notification={n} />
                ))}
            </AnimatePresence>
        </div>
    );
};
