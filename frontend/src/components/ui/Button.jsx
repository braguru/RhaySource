import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', onClick, className = '', type = 'button' }) => {
  return (
    <button type={type} className={`btn btn-${variant} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
