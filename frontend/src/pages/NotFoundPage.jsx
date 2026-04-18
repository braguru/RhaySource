import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCompass } from 'react-icons/fi';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="container">
        <motion.div 
          className="not-found-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="not-found-icon-wrapper">
            <FiCompass className="not-found-icon" />
          </div>
          
          <h1 className="not-found-title">Page found its way out</h1>
          <p className="not-found-text">
            It looks like the solution you're looking for isn't here. 
            Perhaps it's been moved, or the path has changed.
          </p>
          
          <div className="not-found-actions">
            <Link to="/" className="btn-primary rounded-btn">
              <FiArrowLeft className="btn-icon" />
              Return Home
            </Link>
            <Link to="/shop" className="btn-outline rounded-btn">
              Explore Shop
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
