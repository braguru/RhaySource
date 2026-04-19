import React from 'react';
import Skeleton from '../../ui/Skeleton';
import '../../features/ProductCard.css';

export default function ProductCardSkeleton() {
  return (
    <div className="product-card skeleton-card">
      <div className="product-image-container" style={{ position: 'relative' }}>
        <Skeleton height="320px" borderRadius="var(--radius-md)" />
      </div>
      
      <div className="product-info" style={{ padding: '1.5rem 0' }}>
        <Skeleton width="40%" height="0.8rem" style={{ marginBottom: '1rem' }} />
        <Skeleton width="90%" height="1.2rem" style={{ marginBottom: '0.75rem' }} />
        <Skeleton width="30%" height="1rem" style={{ marginBottom: '1.5rem' }} />
        
        <div style={{ marginTop: 'auto' }}>
          <Skeleton height="45px" borderRadius="100px" />
        </div>
      </div>
    </div>
  );
}
