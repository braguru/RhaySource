import React from 'react';
import './Skeleton.css';

export default function Skeleton({ width, height, borderRadius = '4px', className = '' }) {
  return (
    <div 
      className={`skeleton-box ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || '1em', 
        borderRadius 
      }}
    />
  );
}
