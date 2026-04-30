import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import StudioPagination from '../../components/admin/StudioPagination';
import StudioConfirmModal from '../../components/admin/StudioConfirmModal';
import StudioToast from '../../components/admin/StudioToast';
import { supabase } from '../../lib/supabase';
import { FiSettings, FiSave, FiPlus, FiTrash2, FiSearch, FiX, FiFilter, FiActivity, FiClock, FiBox, FiCheck, FiLayers } from 'react-icons/fi';
import '../../styles/admin.css';
import { toSlug } from '../../utils/slug';

export default function StudioStoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStore, setEditingStore] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, maintenance
  const [filterInventory, setFilterInventory] = useState('all'); // all, occupied, empty

  // Form state for creation/edit
  const [formData, setFormData] = useState({ name: '', label: '', accent_color: '#1a1a1b', slug: '', is_active: true });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);

  // Toast state
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    setLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .select('*, products(count), categories(count)')
      .order('name');
      
    if (!error) {
      // Map Supabase count format to a cleaner property
      const mapped = (data || []).map(s => ({
        ...s,
        product_count: s.products?.[0]?.count || 0,
        category_count: s.categories?.[0]?.count || 0
      }));
      setStores(mapped);
    }
    setLoading(false);
  }

  const handleOpenDrawer = (store = null) => {
    if (store) {
      setEditingStore(store);
      setFormData({ 
        name: store.name, 
        label: store.label || '', 
        accent_color: store.accent_color || '#1a1a1b',
        slug: store.slug || '',
        is_active: store.is_active ?? true
      });
    } else {
      setEditingStore(null);
      setFormData({ name: '', label: '', accent_color: '#1a1a1b', slug: '', is_active: true });
    }
    setIsDrawerOpen(true);
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    const payload = {
      name: formData.name.trim(),
      label: formData.label.trim(),
      accent_color: formData.accent_color,
      slug: formData.slug.trim() || toSlug(formData.name),
      is_active: formData.is_active
    };

    try {
      const { data, error } = editingStore
        ? await supabase.from('stores').update(payload).eq('id', editingStore.id).select()
        : await supabase.from('stores').insert([payload]).select();

      if (!error) {
        await fetchStores();
        setIsDrawerOpen(false);
        setToast({ 
          isOpen: true, 
          message: editingStore ? 'Store configuration updated successfully.' : 'New storefront identity established.', 
          type: 'success' 
        });
      } else {
        console.error('Store Save Error:', error);
        setToast({ isOpen: true, message: 'Database Error: ' + error.message, type: 'error' });
      }
    } catch (err) {
      console.error('Store Submit Exception:', err);
      setToast({ isOpen: true, message: 'Critical Exception: ' + err.message, type: 'error' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleStatusToggle = async (store) => {
    const newStatus = !store.is_active;
    const { error } = await supabase
      .from('stores')
      .update({ is_active: newStatus })
      .eq('id', store.id);
    
    if (!error) {
      // Refetch to be absolutely certain of the DB state
      await fetchStores();
      setToast({ 
        isOpen: true, 
        message: `Store operational status synchronized: ${newStatus ? 'LIVE' : 'MAINTENANCE'}.`, 
        type: 'success' 
      });
    } else {
      console.error('Toggle Error:', error);
      setToast({ isOpen: true, message: 'Status Sync Failed: ' + error.message, type: 'error' });
    }
  };

  const handleDeleteRequest = (store) => {
    setStoreToDelete(store);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!storeToDelete) return;
    
    // Safety check: Don't delete stores that have inventory
    if (storeToDelete.product_count > 0) {
      setToast({ 
        isOpen: true, 
        message: 'Cannot delete a store with active inventory. Please remove or reassign products first.', 
        type: 'error' 
      });
      setIsDeleteModalOpen(false);
      return;
    }

    const { error } = await supabase.from('stores').delete().eq('id', storeToDelete.id);
    if (!error) {
      setStores(stores.filter(s => s.id !== storeToDelete.id));
      setIsDeleteModalOpen(false);
      setStoreToDelete(null);
      setToast({ isOpen: true, message: 'Store identity has been successfully purged.', type: 'success' });
    } else {
      setToast({ isOpen: true, message: 'Deletion Failed: ' + error.message, type: 'error' });
    }
  };

  const filteredStores = stores.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.label?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && s.is_active) || 
      (filterStatus === 'maintenance' && !s.is_active);

    const matchesInventory = 
      filterInventory === 'all' ||
      (filterInventory === 'occupied' && s.product_count > 0) ||
      (filterInventory === 'empty' && s.product_count === 0);

    return matchesSearch && matchesStatus && matchesInventory;
  });

  const paginatedStores = filteredStores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterInventory]);

  return (
    <AdminLayout title="Store Configuration">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
        <p style={{ color: 'var(--studio-text-muted)', fontSize: '0.9rem', maxWidth: '800px', margin: 0 }}>
          Manage the collection identifiers and visual accents for the active storefronts. Use the search tool to quickly locate store metadata.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexGrow: 1, maxWidth: '500px' }}>
            <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--studio-text)', zIndex: 1 }} />
            <input 
              type="text" 
              className="studio-input" 
              placeholder="Search active stores..." 
              style={{ paddingLeft: '3.5rem', border: '1px solid #cbd5e1' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className="studio-btn-primary" onClick={() => handleOpenDrawer()} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FiPlus size={18} /> Add New Store
          </button>
        </div>

        {/* Standardized Filters Toolbar (Lifecycle Management) */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--studio-text-muted)' }}>
            <FiFilter size={16} /> Filter by:
          </div>
          
          <select 
            className="studio-select" 
            style={{ width: 'auto', minWidth: '160px', fontSize: '0.8rem' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Operational Status (All)</option>
            <option value="active">Live Storefronts</option>
            <option value="maintenance">Maintenance Mode</option>
          </select>

          <select 
            className="studio-select" 
            style={{ width: 'auto', minWidth: '160px', fontSize: '0.8rem' }}
            value={filterInventory}
            onChange={(e) => setFilterInventory(e.target.value)}
          >
            <option value="all">Inventory Presence (All)</option>
            <option value="occupied">Occupied Stores</option>
            <option value="empty">Empty Storefronts</option>
          </select>

          {(searchTerm || filterStatus !== 'all' || filterInventory !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterInventory('all'); }}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      <div className="studio-glass" style={{ border: '1px solid var(--studio-border)', overflow: 'hidden' }}>
        <div className="studio-table-container">
          <table className="studio-table">
            <thead>
              <tr>
                <th>Store Identity</th>
                <th>Inventory Density</th>
                <th>Taxonomy Density</th>
                <th>Operational Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '6rem' }}>
                  <div style={{ color: 'var(--studio-sidebar-text)', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.8rem' }}>Syncing Infrastructure...</div>
                </td></tr>
              ) : filteredStores.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '6rem', color: 'var(--studio-text-muted)' }}>No stores match the current query.</td></tr>
              ) : paginatedStores.map(store => (
                <tr key={store.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: store.accent_color, border: '1px solid #fff', boxShadow: '0 0 0 1px #eee' }} />
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--studio-text)' }}>{store.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--studio-text-muted)' }}>{store.label || 'No descriptor'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: store.product_count > 0 ? 'var(--studio-text)' : 'var(--studio-text-muted)' }}>
                      <FiBox size={14} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{store.product_count} pieces</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: store.category_count > 0 ? 'var(--studio-text)' : 'var(--studio-text-muted)' }}>
                      <FiLayers size={14} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{store.category_count} categories</span>
                    </div>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleStatusToggle(store)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem', 
                        background: store.is_active ? '#ecfdf5' : '#fef2f2',
                        color: store.is_active ? '#059669' : '#dc2626',
                        padding: '0.4rem 0.8rem', borderRadius: '20px', border: 'none',
                        fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {store.is_active ? <><FiActivity size={12} /> LIVE</> : <><FiClock size={12} /> MAINTENANCE</>}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        className="studio-btn-icon"
                        onClick={() => handleOpenDrawer(store)}
                        style={{ background: 'var(--studio-surface)', border: '1px solid var(--studio-border)' }}
                      >
                        <FiSettings size={15} />
                      </button>
                      <button
                        className="studio-btn-icon"
                        onClick={() => handleDeleteRequest(store)}
                        style={{ background: '#fff0f0', border: '1px solid #ffecec', color: '#ff4d4d' }}
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <StudioPagination 
          totalItems={filteredStores.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {isDrawerOpen && (
        <div style={{
          position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '500px', height: '100vh',
          background: '#ffffff', borderLeft: '1px solid var(--studio-border)',
          zIndex: 1000, padding: '3rem', animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <h2 className="studio-title" style={{ fontSize: '1.5rem', margin: 0 }}>{editingStore ? 'Edit Storefront' : 'Establish New Store'}</h2>
            <button onClick={() => setIsDrawerOpen(false)} className="studio-btn-icon"><FiX size={24} /></button>
          </div>

          <form onSubmit={handleSaveStore} style={{ flexGrow: 1 }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Store Name</label>
              <input 
                className="studio-input" 
                style={{ marginTop: '0.5rem' }}
                value={formData.name} 
                onChange={e => {
                  const val = e.target.value;
                  setFormData({...formData, name: val, slug: editingStore ? formData.slug : toSlug(val)});
                }}
                placeholder="e.g. Workspace Collection"
                required 
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Public Slug (Routing)</label>
              <input 
                className="studio-input" 
                style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '0.8rem' }}
                value={formData.slug} 
                onChange={e => setFormData({...formData, slug: toSlug(e.target.value)})}
                placeholder="workspace-collection"
                required 
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Subtitle / Label</label>
              <input 
                className="studio-input" 
                style={{ marginTop: '0.5rem' }}
                value={formData.label} 
                onChange={e => setFormData({...formData, label: e.target.value})}
                placeholder="Premium Office Gear"
              />
            </div>
            <div style={{ marginBottom: '2.5rem' }}>
              <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Accent Visual ID (Color)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <input
                  type="color"
                  value={formData.accent_color}
                  onChange={e => setFormData({...formData, accent_color: e.target.value})}
                  style={{ width: '50px', height: '50px', padding: 0, border: '1px solid var(--studio-border)', borderRadius: '8px', cursor: 'pointer' }}
                />
                <input
                  className="studio-input"
                  value={formData.accent_color}
                  onChange={e => setFormData({...formData, accent_color: e.target.value})}
                  style={{ flexGrow: 1, fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.8rem', color: '#1a1a1b' }}>Visibility Control</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Hide or display this storefront on the site.</div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                  style={{ 
                    background: formData.is_active ? '#22c55e' : '#94a3b8',
                    width: '44px', height: '24px', borderRadius: '12px',
                    position: 'relative', border: 'none', cursor: 'pointer',
                    transition: 'background 0.3s'
                  }}
                >
                  <div style={{ 
                    position: 'absolute', top: '2px', left: formData.is_active ? '22px' : '2px',
                    width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                    transition: 'left 0.3s'
                  }} />
                </button>
              </div>
            </div>

            <button type="submit" className="studio-btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }} disabled={saveLoading}>
              {saveLoading ? 'Processing...' : <><FiSave /> {editingStore ? 'Authorize Changes' : 'Establish Storefront'}</>}
            </button>
          </form>
        </div>
      )}

      <StudioConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Purge Store Identity?"
        message="Are you sure you want to permanently remove this store? This action will fail if there are active products assigned to it."
        productName={storeToDelete?.name}
        confirmText="Remove Store"
      />

      <StudioToast 
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </AdminLayout>
  );
}
