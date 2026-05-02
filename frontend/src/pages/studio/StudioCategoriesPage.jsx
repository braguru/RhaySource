import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import StudioConfirmModal from '../../components/admin/StudioConfirmModal';
import StudioPagination from '../../components/admin/StudioPagination';
import StudioToast from '../../components/admin/StudioToast';
import { supabase } from '../../lib/supabase';
import { 
  FiPlus, FiEdit2, FiTrash2, FiGrid, FiSearch, FiCheck, FiX, FiFilter,
  FiDroplet, FiSun, FiMoon, FiHome, FiArchive, FiMonitor, 
  FiCpu, FiBox, FiLayers, FiPackage, FiAward, FiEye 
} from 'react-icons/fi';
import '../../styles/admin.css';

export default function StudioCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '', store_id: '' });
  const [saving, setSaving] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter state
  const [filterStore, setFilterStore] = useState('all');

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // Toast state
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  const iconMap = {
    FiGrid: <FiGrid size={18} />,
    FiDroplet: <FiDroplet size={18} />,
    FiSun: <FiSun size={18} />,
    FiMoon: <FiMoon size={18} />,
    FiHome: <FiHome size={18} />,
    FiArchive: <FiArchive size={18} />,
    FiMonitor: <FiMonitor size={18} />,
    FiCpu: <FiCpu size={18} />,
    FiBox: <FiBox size={18} />,
    FiLayers: <FiLayers size={18} />,
    FiPackage: <FiPackage size={18} />,
    FiAward: <FiAward size={18} />,
    FiEye: <FiEye size={18} />
  };

  const availableIcons = Object.keys(iconMap);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const [
      { data: catData, error: catErr },
      { data: storeData, error: storeErr }
    ] = await Promise.all([
      supabase.from('categories').select('*, stores(name, accent_color), products(count)').order('name'),
      supabase.from('stores').select('*').order('name')
    ]);

    if (!catErr) {
      const mapped = (catData || []).map(c => ({
        ...c,
        product_count: c.products?.[0]?.count || 0
      }));
      setCategories(mapped);
    }
    if (!storeErr) setStores(storeData || []);
    
    setLoading(false);
  }

  const handleOpenDrawer = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({ 
        name: category.name, 
        description: category.description || '', 
        icon: category.icon || '',
        store_id: category.store_id || ''
      });
    } else {
      setSelectedCategory(null);
      setFormData({ name: '', description: '', icon: 'FiGrid', store_id: filterStore !== 'all' ? filterStore : '' });
    }
    setIsDrawerOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      icon: formData.icon,
      store_id: formData.store_id && formData.store_id !== '' ? formData.store_id : null
    };

    if (!payload.store_id) {
      setToast({ isOpen: true, message: 'Taxonomy Error: Store assignment is mandatory.', type: 'error' });
      setSaving(false);
      return;
    }
    
    try {
      const { data, error } = selectedCategory
        ? await supabase.from('categories').update(payload).eq('id', selectedCategory.id).select()
        : await supabase.from('categories').insert([payload]).select();

      if (!error) {
        // Cascade Update: If the name was changed, sync it to the denormalized 'category' column in products table
        if (selectedCategory && selectedCategory.name !== payload.name) {
          console.log(`Cascading name change from "${selectedCategory.name}" to "${payload.name}" for all linked products...`);
          const { error: cascadeError } = await supabase
            .from('products')
            .update({ category: payload.name })
            .eq('category_id', selectedCategory.id);
            
          if (cascadeError) {
            console.error('Cascade Update Error:', cascadeError);
            // We don't block the UI here, but we log it. The main category update succeeded.
          }
        }

        await fetchCategories();
        setIsDrawerOpen(false);
        setToast({ 
          isOpen: true, 
          message: selectedCategory ? 'Taxonomy entry updated.' : 'New category established.', 
          type: 'success' 
        });
      } else {
        console.error('Category Save Error:', error);
        setToast({ isOpen: true, message: 'Database Error: ' + error.message, type: 'error' });
      }
    } catch (err) {
      console.error('Category Submit Exception:', err);
      setToast({ isOpen: true, message: 'Critical Exception: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', categoryToDelete.id);

    if (!error) {
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      setToast({ isOpen: true, message: 'The category has been successfully purged from the taxonomy.', type: 'success' });
    } else {
      setToast({ isOpen: true, message: 'Deletion Failed: ' + error.message, type: 'error' });
    }
  };

  const filteredCategories = categories.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = filterStore === 'all' || c.store_id === filterStore;

    return matchesSearch && matchesStore;
  });

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStore]);

  return (
    <AdminLayout title="Catalog Taxonomy">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
        <p style={{ color: 'var(--studio-text-muted)', fontSize: '0.9rem', maxWidth: '800px', margin: 0 }}>
          Manage the official product taxonomy. Use the search tool to quickly locate specific categories within the repository.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexGrow: 1, maxWidth: '500px' }}>
            <FiSearch style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--studio-text)', zIndex: 1 }} />
            <input 
              type="text" 
              className="studio-input" 
              placeholder="Search taxonomy entries..." 
              style={{ paddingLeft: '3.5rem', border: '1px solid #cbd5e1' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button className="studio-btn-primary" onClick={() => handleOpenDrawer()} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FiPlus size={18} /> Add Category
          </button>
        </div>

        {/* Standardized Filters Toolbar (Visual Consistency) */}
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

          { (searchTerm || filterStore !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setFilterStore('all'); }}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="studio-glass" style={{ border: '1px solid var(--studio-border)', overflow: 'hidden' }}>
        <table className="studio-table">
          <thead>
            <tr>
              <th>Category Identity</th>
              <th>Assigned Store</th>
              <th>Density</th>
              <th>Description</th>
              <th style={{ textAlign: 'right' }}>Management</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '6rem' }}>
                <div style={{ color: 'var(--studio-text-muted)', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Synchronizing Taxonomy...</div>
              </td></tr>
            ) : filteredCategories.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '6rem', color: 'var(--studio-text-muted)' }}>No categories match the current query.</td></tr>
            ) : (
              paginatedCategories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '6px', 
                        background: 'var(--studio-surface)', 
                        border: '1px solid var(--studio-border)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'var(--studio-sidebar-text)'
                      }}>
                        {iconMap[category.icon] || <FiGrid size={18} />}
                      </div>
                      <div style={{ fontWeight: '600', color: 'var(--studio-text)' }}>{category.name}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: category.stores?.accent_color || 'var(--studio-accent)' }} />
                      <span style={{ fontWeight: '500' }}>{category.stores?.name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: category.product_count > 0 ? 'var(--studio-text)' : 'var(--studio-text-muted)' }}>
                      <FiBox size={14} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{category.product_count} items</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--studio-text-muted)', fontSize: '0.85rem' }}>{category.description || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className="studio-btn-icon" onClick={() => handleOpenDrawer(category)} style={{ background: 'var(--studio-surface)', border: '1px solid var(--studio-border)', borderRadius: '6px' }}><FiEdit2 size={14} /></button>
                      <button className="studio-btn-icon" onClick={() => handleDelete(category)} style={{ background: '#fff0f0', border: '1px solid #ffecec', borderRadius: '6px', color: '#ff4d4d' }}><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <StudioPagination 
          totalItems={filteredCategories.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {isDrawerOpen && (
        <div style={{
          position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '500px', height: '100vh',
          background: '#ffffff', borderLeft: '1px solid var(--studio-border)', zIndex: 1000,
          display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.05)'
        }}>
          <header style={{ padding: '2rem', borderBottom: '1px solid var(--studio-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="studio-title" style={{ fontSize: '1.25rem', margin: 0 }}>
              {selectedCategory ? 'Modify Category' : 'New Taxonomy Entry'}
            </h2>
            <button onClick={() => setIsDrawerOpen(false)} className="studio-btn-icon"><FiX size={20} /></button>
          </header>

          <form onSubmit={handleSave} style={{ padding: '2rem', flexGrow: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Category Name</label>
                <input 
                  required
                  className="studio-input" 
                  style={{ marginTop: '0.5rem' }}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Visual Identity (Icon)</label>
                <select 
                  className="studio-input" 
                  style={{ marginTop: '0.5rem' }}
                  value={formData.icon}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                >
                  {availableIcons.map(iconName => (
                    <option key={iconName} value={iconName}>{iconName.replace('Fi', '')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Target Store</label>
              <select 
                required
                className="studio-input" 
                style={{ marginTop: '0.5rem' }}
                value={formData.store_id}
                onChange={e => setFormData({ ...formData, store_id: e.target.value })}
              >
                <option value="">Select a store assignment...</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Description</label>
              <textarea 
                className="studio-input" 
                rows="4"
                style={{ resize: 'none', marginTop: '0.5rem' }}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button type="submit" className="studio-btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem' }} disabled={saving}>
              {saving ? 'Processing...' : <><FiCheck /> Authorize Changes</>}
            </button>
          </form>
        </div>
      )}

      <StudioConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Taxonomy Entry?"
        message="Are you sure you want to remove this category? Products currently assigned to this category will have their category reference cleared."
        productName={categoryToDelete?.name}
        confirmText="Confirm Deletion"
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
