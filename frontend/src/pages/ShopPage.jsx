import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/features/ProductCard';
import productsData from '../data/products.json';
import './ShopPage.css';

const CATEGORIES = ['All', 'Serums', 'Moisturizers', 'Cleansers', 'Eye Care', 'Toners', 'Masks', 'Sunscreen', 'Body Care', 'Sets'];
const SKIN_TYPES = ['All', 'Dry', 'Oily', 'Sensitive', 'Normal', 'Combination'];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';
  const activeConcern = searchParams.get('concern') || 'All';

  const { products } = productsData;

  const filtered = useMemo(() => {
    return products.filter(p => {
      const categoryMatch = activeCategory === 'All' || p.category === activeCategory;
      const concernMatch = activeConcern === 'All' || p.skinType.includes(activeConcern);
      return categoryMatch && concernMatch;
    });
  }, [products, activeCategory, activeConcern]);

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value === 'All') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  }

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="container">
          <h1 className="shop-title">All Products</h1>
          <p className="shop-subtitle">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'} found
          </p>
        </div>
      </div>

      <div className="container shop-body">
        <aside className="shop-filters">
          <div className="filter-group">
            <h3 className="filter-label">Category</h3>
            <div className="filter-options">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilter('category', cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h3 className="filter-label">Skin Type</h3>
            <div className="filter-options">
              {SKIN_TYPES.map(type => (
                <button
                  key={type}
                  className={`filter-btn ${activeConcern === type ? 'active' : ''}`}
                  onClick={() => setFilter('concern', type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="shop-results">
          {filtered.length === 0 ? (
            <div className="shop-empty">
              <p>No products match the selected filters.</p>
              <button
                className="filter-btn active"
                onClick={() => setSearchParams({})}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
