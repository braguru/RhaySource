import React, { useState, useEffect, useMemo } from 'react';
import { FiX, FiCheck, FiImage, FiUpload } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';
import { toSlug } from '../../utils/slug';

/**
 * ProductFormDrawer - A streamlined, professional admin interface for managing the product catalog.
 * Features: 
 * - Automated SEO Slug generation
 * - Professional field terminology
 * - Drag-and-drop image ingestion to Cloudinary
 * - Cascading Store -> Category synchronization
 */
export default function ProductFormDrawer({ isOpen, onClose, product, stores, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand: '',
    category_id: '',
    price: '',
    description: '',
    store_id: '',
    image_url: '',
    is_featured: false,
    specs: {}
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);

  const isDragging = dragCounter > 0;

  // 1. Initial Data Load (Categories)
  useEffect(() => {
    if (isOpen) {
      async function fetchCategories() {
        try {
          const { data } = await supabase.from('categories').select('*').order('name');
          if (data) setCategories(data);
        } catch (err) {
          console.error('Category Fetch Error:', err);
        }
      }
      fetchCategories();
    }
  }, [isOpen]);

  // 2. Synchronize Form with Incoming Product Data
  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        slug: product.slug || toSlug(product.name || ''),
        category_id: product.category_id || ''
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        brand: '',
        category_id: '',
        price: '',
        description: '',
        store_id: stores[0]?.id || '',
        image_url: '',
        is_featured: false,
        specs: {}
      });
    }
  }, [product, stores, isOpen]);

  // 3. Store -> Category Synchronization (Relational Taxonomy)
  const availableCategories = useMemo(() => {
    if (!formData.store_id || categories.length === 0) return categories;
    
    // Filter categories that belong to the selected store
    return categories.filter(c => c.store_id === formData.store_id);
  }, [formData.store_id, categories]);

  // 4. Input Handlers
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: newName,
      slug: toSlug(newName)
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter") {
      setDragCounter(prev => prev + 1);
    } else if (e.type === "dragleave") {
      setDragCounter(prev => prev - 1);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(0);
    console.log('[DropZone] Drop detected');

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
      return;
    }

    // Support for dragging images from other tabs
    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) {
            processFile(file);
            return;
          }
        }
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const processFile = async (file) => {
    console.log('[DropZone] 1. Starting processFile with:', { name: file.name, type: file.type });
    
    if (!file.type.startsWith('image/')) {
      console.warn('[DropZone] 1a. File rejected: Not an image');
      alert('Please upload an image file.');
      return;
    }

    // Immediate Visual Feedback (High-Compatibility Data URL)
    try {
      console.log('[DropZone] 2. Reading file as Data URL...');
      
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('FileReader failed'));
        reader.readAsDataURL(file);
      });

      console.log('[DropZone] 3. Data URL Generated (Length:', dataUrl.length, ')');
      setPreviewUrl(dataUrl);
      setUploading(true);
      console.log('[DropZone] 4. State updated (previewUrl & uploading)');
    } catch (e) {
      console.error('[DropZone] ERROR in local preview:', e);
      // Fallback to uploading state even without preview if needed
      setUploading(true);
    }

    try {
      const signResponse = await fetch('/api/images/sign', { method: 'POST' });
      if (!signResponse.ok) throw new Error('API Signing failed');
      const { signature, timestamp, cloud_name, api_key } = await signResponse.json();

      const uploadPayload = new FormData();
      uploadPayload.append('file', file);
      uploadPayload.append('signature', signature);
      uploadPayload.append('timestamp', timestamp);
      uploadPayload.append('api_key', api_key);
      uploadPayload.append('upload_preset', 'rhaysource_products');
      uploadPayload.append('folder', 'rhaysource/products');

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        { method: 'POST', body: uploadPayload }
      );
      
      const resData = await uploadResponse.json();
      
      if (resData.secure_url) {
        setFormData(prev => ({ ...prev, image_url: resData.secure_url }));
        setPreviewUrl(null); // Clear preview once we have the real thing
      } else {
        throw new Error(resData.error?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Upload failed: ' + err.message);
      setPreviewUrl(null); // Revert on failure
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { ...formData };
    // Cleanup extra properties
    delete payload.stores;
    delete payload.categories;
    delete payload.category;

    try {
      const { data, error } = product
        ? await supabase.from('products').update(payload).eq('id', product.id).select()
        : await supabase.from('products').insert([payload]).select();

      if (error) throw error;

      if (data && data.length > 0) {
        onSave(data[0]);
        onClose();
      }
    } catch (err) {
      console.error('Submit Error:', err);
      alert('Error saving product: ' + (err.message || 'An unexpected error occurred'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '100%',
      maxWidth: '600px',
      height: '100vh',
      background: '#ffffff',
      borderLeft: '1px solid var(--studio-border)',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.02)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <header style={{ padding: '2rem', borderBottom: '1px solid var(--studio-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="studio-title" style={{ fontSize: '1.25rem', margin: 0 }}>
          {product ? 'Modify Specification' : 'New Catalog Entry'}
        </h2>
        <button onClick={onClose} className="studio-btn-icon"><FiX size={20} /></button>
      </header>

      <form onSubmit={handleSubmit} style={{ padding: '2rem', flexGrow: 1, overflowY: 'auto' }}>
        {/* Visual Asset Ingestion Area (Drag & Drop) */}
        <div style={{ marginBottom: '2.5rem' }}>
          <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Product Visual</label>
          <div 
            className="drop-zone-container"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            style={{ 
              height: '240px', 
              marginTop: '0.75rem', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              overflow: 'hidden',
              background: '#fcfcfc',
              border: '1px solid var(--studio-border)',
              position: 'relative',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
          }}>
            {/* The Actual Content */}
            <div style={{ pointerEvents: 'none', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {(previewUrl || formData.image_url) ? (
                <img 
                  src={previewUrl || formData.image_url} 
                  alt="Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  onError={(e) => {
                    console.error('[DropZone] Image Render Error:', e);
                    setPreviewUrl(null); // Fallback to whatever is in the state
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--studio-text-muted)' }}>
                  <FiImage size={32} style={{ marginBottom: '1rem', opacity: 0.1 }} />
                  <p style={{ fontSize: '0.75rem' }}>Drag image here or use the button below</p>
                </div>
              )}
            </div>

            {/* The Bulletproof Interaction Overlay */}
            {isDragging && (
              <div 
                onDrop={handleDrop}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'rgba(240, 244, 255, 0.9)', 
                  border: '2px dashed #1a1a1b',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 20,
                  backdropFilter: 'blur(2px)'
                }}
              >
                <div style={{ textAlign: 'center', color: '#1a1a1b' }}>
                  <FiUpload size={32} style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Drop to Ingest Asset</p>
                </div>
              </div>
            )}
            
            {uploading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', alignItems: 'center', zIndex: 30 }}>
                <div className="upload-spinner" style={{ width: '32px', height: '32px', border: '3px solid #f3f3f3', borderTop: '3px solid #1a1a1b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#1a1a1b', letterSpacing: '0.05em' }}>SYNCING WITH CLOUD...</span>
              </div>
            )}
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <label style={{ 
              border: '1px solid #1a1a1b', 
              padding: '0.75rem 1.5rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: '#1a1a1b',
              color: '#ffffff',
              borderRadius: '6px',
              width: '100%',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <FiUpload size={16} />
              <input type="file" id="image-upload" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              <span style={{ marginLeft: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                {uploading ? 'Ingesting Visual...' : 'Select Image File'}
              </span>
            </label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Product Name</label>
            <input 
              required
              className="studio-input" 
              value={formData.name} 
              onChange={handleNameChange} 
              style={{ marginTop: '0.5rem' }}
            />
          </div>
          <div>
            <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Retail Price (GH₵)</label>
            <input 
              required
              type="number" 
              className="studio-input" 
              placeholder="0.00"
              value={formData.price} 
              onChange={e => setFormData({...formData, price: e.target.value})} 
              style={{ marginTop: '0.5rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div>
            <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Assigned Store</label>
            <select 
              className="studio-select"
              value={formData.store_id}
              onChange={e => {
                setFormData({...formData, store_id: e.target.value, category_id: ''});
              }}
              style={{ marginTop: '0.5rem' }}
            >
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Product Category</label>
            <select 
              className="studio-select"
              required
              value={formData.category_id}
              onChange={e => setFormData({...formData, category_id: e.target.value})}
              style={{ marginTop: '0.5rem' }}
            >
              <option value="">Select Category</option>
              {availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Narrative Description</label>
          <textarea 
            className="studio-input" 
            rows="5"
            style={{ resize: 'none', marginTop: '0.5rem' }}
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
          />
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--studio-border)' }}>
          <input 
            type="checkbox" 
            id="featured"
            className="studio-checkbox"
            checked={formData.is_featured} 
            onChange={e => setFormData({...formData, is_featured: e.target.checked})} 
          />
          <div>
            <label htmlFor="featured" style={{ color: 'var(--studio-text)', fontSize: '0.9rem', fontWeight: 'bold', display: 'block' }}>Elevate to Featured Collection</label>
            <p style={{ fontSize: '0.75rem', color: 'var(--studio-text-muted)', margin: 0, marginTop: '2px' }}>This piece will be highlighted on the main landing page and best-seller lists.</p>
          </div>
        </div>
      </form>

      <footer style={{ padding: '2rem', borderTop: '1px solid var(--studio-border)', display: 'flex', gap: '1rem', background: '#ffffff' }}>
        <button 
          onClick={handleSubmit} 
          className="studio-btn-primary" 
          style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          disabled={loading}
        >
          {loading ? 'Processing...' : <><FiCheck /> Authorize Entry</>}
        </button>
        <button onClick={onClose} className="studio-btn-icon" style={{ border: '1px solid var(--studio-border)', padding: '0 1.5rem', borderRadius: '6px' }}>
          Cancel
        </button>
      </footer>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .studio-checkbox {
          width: 22px;
          height: 22px;
          accent-color: var(--studio-sidebar);
          cursor: pointer;
        }
        .studio-input:focus, .studio-select:focus {
          border-color: var(--studio-sidebar);
          outline: none;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
