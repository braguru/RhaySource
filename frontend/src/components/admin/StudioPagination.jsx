import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const StudioPagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  // Limit visible pages if there are too many (e.g., 1 2 3 ... 10)
  const renderPages = () => {
    if (totalPages <= 7) return pages;
    
    if (currentPage <= 4) return [...pages.slice(0, 5), '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', ...pages.slice(totalPages - 5)];
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1.5rem 2.5rem', 
      borderTop: '1px solid var(--studio-border)',
      background: '#fcfcfc'
    }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--studio-text-muted)' }}>
        Showing <span style={{ fontWeight: '600', color: 'var(--studio-text)' }}>{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to <span style={{ fontWeight: '600', color: 'var(--studio-text)' }}>{Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span style={{ fontWeight: '600', color: 'var(--studio-text)' }}>{totalItems}</span> results
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <button 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{ 
            padding: '0.5rem', 
            background: 'none', 
            border: '1px solid var(--studio-border)', 
            borderRadius: '6px',
            color: currentPage === 1 ? '#d1d5db' : 'var(--studio-text)',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'var(--studio-transition)'
          }}
        >
          <FiChevronLeft size={18} />
        </button>

        {renderPages().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} style={{ padding: '0 0.5rem', color: 'var(--studio-text-muted)' }}>...</span>
          ) : (
            <button 
              key={page}
              onClick={() => onPageChange(page)}
              style={{ 
                minWidth: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.25rem', 
                background: currentPage === page ? 'var(--studio-accent)' : 'none', 
                border: '1px solid',
                borderColor: currentPage === page ? 'var(--studio-accent)' : 'var(--studio-border)', 
                borderRadius: '6px',
                color: currentPage === page ? '#000' : 'var(--studio-text)',
                fontWeight: currentPage === page ? '600' : '400',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'var(--studio-transition)'
              }}
            >
              {page}
            </button>
          )
        ))}

        <button 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{ 
            padding: '0.5rem', 
            background: 'none', 
            border: '1px solid var(--studio-border)', 
            borderRadius: '6px',
            color: currentPage === totalPages ? '#d1d5db' : 'var(--studio-text)',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'var(--studio-transition)'
          }}
        >
          <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default StudioPagination;
