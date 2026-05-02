import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductFormDrawer from '../../components/admin/ProductFormDrawer';
import StudioConfirmModal from '../../components/admin/StudioConfirmModal';
import StudioPagination from '../../components/admin/StudioPagination';
import StudioToast from '../../components/admin/StudioToast';
import { supabase } from '../../lib/supabase';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiStar } from 'react-icons/fi';
import '../../styles/admin.css';

export default function StudioProductsPage() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStore, setFilterStore] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData({ refreshAll = true } = {}) {
    setLoading(true);

    // On subsequent saves, stores and categories don't change — only re-fetch
    // them on the initial page load to avoid 3 concurrent connections every time
    // a product is saved.
    const queries = [
      supabase.from('products').select('*, stores(name, accent_color), categories(name)').order('created_at', { ascending: false }),
      ...(refreshAll ? [
        supabase.from('stores').select('*').order('name', { ascending: true }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
      ] : []),
    ];

    const results = await Promise.all(queries);
    const [{ data: productsData, error: productsError }] = results;
    const storesError = refreshAll ? results[1]?.error : null;
    const categoriesError = refreshAll ? results[2]?.error : null;

    if (!productsError) setProducts(productsData || []);
    if (refreshAll && !storesError) setStores(results[1]?.data || []);
    if (refreshAll && !categoriesError) setCategories(results[2]?.data || []);

    const firstError = productsError || storesError || categoriesError;
    if (firstError) {
      setToast({ isOpen: true, message: 'Failed to load catalog data. Check your connection and refresh the page.', type: 'error' });
    }

    setLoading(false);
  }

  // Relational Logic: Derive categories assigned to the selected store
  const availableCategories = useMemo(() => {
    if (filterStore === 'all') return categories;
    return categories.filter(c => c.store_id === filterStore);
  }, [filterStore, categories]);

  // Reset category if it's no longer available in the newly selected store
  useEffect(() => {
    if (filterCategory !== 'all' && !availableCategories.find(c => c.id === filterCategory)) {
      setFilterCategory('all');
    }
  }, [filterStore, availableCategories]);

  const handleAdd = () => {
    setSelectedProduct(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const handleSave = (savedProduct) => {
    fetchInitialData({ refreshAll: false });
    if (savedProduct) {
      setToast({ isOpen: true, message: `"${savedProduct.name}" has been saved to the catalog.`, type: 'success' });
    } else {
      // Supabase INSERT succeeded but SELECT was blocked (RLS) — product is saved, list is refreshing
      setToast({ isOpen: true, message: 'Product saved. The catalog is refreshing...', type: 'success' });
    }
  };

  const handleSaveError = (message) => {
    setToast({ isOpen: true, message, type: 'error' });
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
    
    if (!error) {
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      setToast({ isOpen: true, message: 'The product has been successfully removed from the catalog.', type: 'success' });
    } else {
      setToast({ isOpen: true, message: 'Critical Error: ' + error.message, type: 'error' });
    }
  };

  // Advanced Multi-stage Live Filtering
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = filterStore === 'all' || p.store_id === filterStore;
    const matchesCategory = filterCategory === 'all' || p.category_id === filterCategory;
    
    return matchesSearch && matchesStore && matchesCategory;
  });

  // Calculate pagination
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStore, filterCategory]);

  return (
    <AdminLayout title="Product Catalog">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {/* High Contrast Live Search */}
          <div style={{ position: 'relative', flexGrow: 1, maxWidth: '600px' }}>
            <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--studio-text)', zIndex: 1 }} />
            <input 
              type="text" 
              className="studio-input" 
              placeholder="Search by name, brand or metadata..." 
              style={{ paddingLeft: '3.5rem', border: '1px solid #cbd5e1' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="studio-btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
              onClick={handleAdd}
            >
              <FiPlus size={18} /> New Product
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--studio-text-muted)' }}>
            <FiFilter size={16} /> Filter by:
          </div>
          
          <select 
            className="studio-select" 
            style={{ width: 'auto', minWidth: '180px', fontSize: '0.8rem' }}
            value={filterStore}
            onChange={(e) => setFilterStore(e.target.value)}
          >
            <option value="all">All Stores</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select 
             className="studio-select" 
             style={{ width: 'auto', minWidth: '180px', fontSize: '0.8rem' }}
             value={filterCategory}
             onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories {filterStore !== 'all' ? '(In Store)' : ''}</option>
            {availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {(filterStore !== 'all' || filterCategory !== 'all' || searchTerm) && (
            <button 
              onClick={() => { setSearchTerm(''); setFilterStore('all'); setFilterCategory('all'); }}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="studio-glass" style={{ overflow: 'hidden', border: '1px solid var(--studio-border)' }}>
        <div className="studio-table-container">
          <table className="studio-table">
            <thead>
              <tr>
                <th>Product Information</th>
                <th>Collection</th>
                <th>Category</th>
                <th>Retail Valuation</th>
                <th>Highlight</th>
                <th style={{ textAlign: 'right' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '6rem' }}>
                    <div style={{ color: 'var(--studio-sidebar-text)', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      Syncing Inventory...
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '6rem', color: 'var(--studio-text-muted)' }}>
                    No items match the current query in the repository.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ 
                          width: '56px', 
                          height: '56px', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          background: '#f8f8f8',
                          border: '1px solid var(--studio-border)'
                        }}>
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <div style={{ color: 'var(--studio-text)', fontWeight: '600', fontSize: '0.9rem' }}>{product.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--studio-text-muted)', marginTop: '2px' }}>{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: product.stores?.accent_color || 'var(--studio-accent)' }} />
                        <span style={{ fontSize: '0.85rem', color: 'var(--studio-text)', fontWeight: '500' }}>{product.stores?.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--studio-text)' }}>{product.categories?.name || 'Unassigned'}</td>
                    <td style={{ fontWeight: '700', color: 'var(--studio-text)', fontSize: '0.9rem' }}>
                      {product.price ? `GH₵${Number(product.price).toLocaleString()}` : <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: '400' }}>Price Pending</span>}
                    </td>
                    <td>
                      {product.is_featured ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D4A000', fontWeight: 'bold', fontSize: '0.7rem' }}>
                          <FiStar fill="#FEBB00" size={14} /> FEATURED
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Standard</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          className="studio-btn-icon" 
                          style={{ background: '#f8f8f8', border: '1px solid var(--studio-border)', borderRadius: '6px', padding: '6px' }}
                          title="Edit"
                          onClick={() => handleEdit(product)}
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button 
                          className="studio-btn-icon" 
                          style={{ background: '#fff0f0', border: '1px solid #ffecec', borderRadius: '6px', padding: '6px', color: '#ff4d4d' }}
                          title="Remove"
                          onClick={() => handleDelete(product)}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ 
          padding: '1rem 2rem', 
          borderTop: '1px solid var(--studio-border)', 
          background: '#fcfcfc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--studio-text-muted)',
          fontWeight: '600'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--studio-success)' }} />
            <span>{filteredProducts.length} TOTAL INVENTORY PIECES IDENTIFIED</span>
          </div>
          <div style={{ letterSpacing: '0.05em' }}>
            {searchTerm || filterStore !== 'all' || filterCategory !== 'all' ? 'FILTERED VIEW ACTIVE' : 'COMPLETE REPOSITORY'}
          </div>
        </div>

        <StudioPagination 
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <ProductFormDrawer 
        key={selectedProduct?.id || 'new-product-entry'}
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        product={selectedProduct}
        stores={stores}
        categories={categories}
        onSave={handleSave}
        onError={handleSaveError}
      />

      <StudioConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove from Inventory?"
        message={`Are you sure you want to permanently remove this piece from the catalog? This action cannot be undone.`}
        productName={productToDelete?.name}
        productImage={productToDelete?.image_url}
        confirmText="Remove Piece"
      />

      <StudioToast 
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </AdminLayout>
  );
}
