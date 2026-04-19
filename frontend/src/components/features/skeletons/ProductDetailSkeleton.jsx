import React from 'react';
import Skeleton from '../../ui/Skeleton';
import '../../../pages/ProductDetailPage.css';

export default function ProductDetailSkeleton() {
  return (
    <div className="product-detail-page py-lg skeleton-detail">
      <div className="container" style={{ marginTop: '4rem' }}>
        <div className="product-detail-grid">
          {/* Gallery Skeleton */}
          <div className="product-gallery">
            <Skeleton height="600px" borderRadius="var(--radius-lg)" />
          </div>

          {/* Info Skeleton */}
          <div className="product-info-panel" style={{ padding: '0 2rem' }}>
            <Skeleton width="30%" height="0.8rem" style={{ marginBottom: '1rem' }} />
            <Skeleton width="80%" height="2.5rem" style={{ marginBottom: '1rem' }} />
            <Skeleton width="40%" height="1.5rem" style={{ marginBottom: '2.5rem' }} />
            
            <div style={{ marginBottom: '2.5rem' }}>
              <Skeleton width="100%" height="1rem" style={{ marginBottom: '0.5rem' }} />
              <Skeleton width="100%" height="1rem" style={{ marginBottom: '0.5rem' }} />
              <Skeleton width="60%" height="1rem" />
            </div>

            <Skeleton height="55px" borderRadius="100px" style={{ marginBottom: '2.5rem' }} />

            <div style={{ marginTop: '2.5rem', borderTop: '1px solid #eee' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ padding: '1.5rem 0', borderBottom: '1px solid #eee' }}>
                  <Skeleton width="40%" height="1rem" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
