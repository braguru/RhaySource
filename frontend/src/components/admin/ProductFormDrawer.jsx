import React, { useState, useEffect, useMemo } from 'react';
import { FiX, FiCheck, FiImage, FiUpload } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';
import { toSlug } from '../../utils/slug';

/**
 * ProductFormDrawer - A streamlined, professional admin interface for managing the product catalog.
 * Features: 
 * - Automated SEO Slug generation
 * - Dedicated Computing Specs for Workspace store
 * - Drag-and-drop image ingestion to Cloudinary
 * - Cascading Store -> Category synchronization
 */
export default function ProductFormDrawer({ isOpen, onClose, product, stores, categories, onSave, onError }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const isDragging = dragCounter > 0;
  const WORKSPACE_STORE_ID = stores?.find(s => s.slug === 'workspace')?.id || '21f7baf6-6896-48e2-809d-dbc09c186d2e';

  // 1. Initial State Derived from Props
  const initialState = useMemo(() => {
    const isWorkspaceProduct = product?.store_id === WORKSPACE_STORE_ID || (stores?.find(s => s.id === product?.store_id)?.slug === 'workspace') || (stores?.[0]?.slug === 'workspace' && !product);
    
    const defaultTechSpecs = { processor: '', memory: '', storage: '', display: '' };
    const mergedSpecs = isWorkspaceProduct 
      ? { ...defaultTechSpecs, ...(product?.specs || {}) } 
      : (product?.specs || {});

    return {
      name: product?.name || '',
      slug: product?.slug || (product?.name ? toSlug(product.name) : ''),
      brand: product?.brand || '',
      category_id: product?.category_id || '',
      price: product?.price || '',
      description: product?.description || '',
      store_id: product?.store_id || stores?.[0]?.id || '',
      image_url: product?.image_url || '',
      is_featured: !!product?.is_featured,
      specs: mergedSpecs
    };
  }, [product, stores]);

  const [formData, setFormData] = useState(initialState);

  // Sync state if props change (though 'key' on parent handles most cases)
  useEffect(() => {
    setFormData(initialState);
    setPreviewUrl(null);
    setSelectedFile(null);
  }, [initialState]);

  const availableCategories = useMemo(() => {
    const cats = Array.isArray(categories) ? categories : [];
    if (!formData.store_id || cats.length === 0) return cats;
    return cats.filter(c => c.store_id === formData.store_id);
  }, [formData.store_id, categories]);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: newName,
      slug: toSlug(newName)
    }));
  };

  const handleSpecChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [key]: value
      }
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter") setDragCounter(prev => prev + 1);
    else if (e.type === "dragleave") setDragCounter(prev => prev - 1);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(0);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const processFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      onError?.('Please upload a valid image file (JPG, PNG, WebP, etc.).');
      return;
    }
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('FileReader failed'));
        reader.readAsDataURL(file);
      });
      setPreviewUrl(dataUrl);
      setSelectedFile(file);
    } catch (e) {
      onError?.('Could not preview the image. Please try a different file.');
    }
  };

  const uploadToCloudinary = async (file) => {
    try {
      setUploading(true);
      // Use query params so the server signs the exact same folder/upload_preset we will send
      const signResponse = await fetch(
        '/api/images/sign?folder=rhaysource/products&upload_preset=rhaysource_products',
        { method: 'POST' }
      );
      
      if (!signResponse.ok) {
        const errText = await signResponse.text();
        throw new Error(`Failed to get upload signature: ${errText}`);
      }

      const { signature, timestamp, cloud_name, api_key, folder, upload_preset } = await signResponse.json();
      
      if (!signature || !cloud_name || !api_key) {
        throw new Error('Incomplete signature data received from server.');
      }

      // Use the folder and upload_preset echoed back by the signing endpoint
      // so the payload exactly matches the signed string.
      const uploadPayload = new FormData();
      uploadPayload.append('file', file);
      uploadPayload.append('signature', signature);
      uploadPayload.append('timestamp', timestamp);
      uploadPayload.append('api_key', api_key);
      uploadPayload.append('upload_preset', upload_preset || 'rhaysource_products');
      uploadPayload.append('folder', folder || 'rhaysource/products');

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, { 
        method: 'POST', 
        body: uploadPayload 
      });

      const resData = await uploadResponse.json();
      
      if (resData.error) {
        console.error('Cloudinary Upload Error:', resData.error);
        throw new Error(resData.error.message || 'Image upload failed');
      }

      return resData.secure_url;
    } catch (err) {
      console.error('Cloudinary Process Failure:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Pre-submission Validation
    if (!formData.name.trim() || !formData.store_id || !formData.brand.trim()) {
      onError?.('Please fill in all required fields: Name, Brand, and Store.');
      return;
    }

    setLoading(true);
    console.log('Starting form submission...', { name: formData.name, mode: product ? 'update' : 'create' });

    // Emergency UI recovery — setTimeout callbacks run in the event loop's task
    // queue and will fire even if the async function below is permanently stuck
    // on a hung await. This guarantees the form unfreezes after 15 seconds.
    let submissionDone = false;
    const emergencyTimer = setTimeout(() => {
      if (!submissionDone) {
        console.warn('Submission timed out — forcing UI recovery.');
        setLoading(false);
        onError?.('Could not save product: The request timed out. Supabase did not respond. Please try again.');
      }
    }, 15000);

    try {
      // 2. Image Handling
      let finalImageUrl = formData.image_url;
      if (selectedFile) {
        console.log('Uploading image to Cloudinary...');
        finalImageUrl = await uploadToCloudinary(selectedFile);
        // Persist URL immediately so retries don't re-upload if Supabase fails
        setFormData(prev => ({ ...prev, image_url: finalImageUrl }));
        setSelectedFile(null);
      }

      // 3. Payload Construction
      const parsedPrice = parseFloat(formData.price);
      const safeCategories = Array.isArray(categories) ? categories : [];
      const safeStores = Array.isArray(stores) ? stores : [];

      const selectedCategory = safeCategories.find(c => c.id === formData.category_id);
      const selectedStore = safeStores.find(s => s.id === formData.store_id);

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || toSlug(formData.name),
        brand: formData.brand.trim(),
        category_id: formData.category_id || null,
        category: selectedCategory ? selectedCategory.name : null,
        price: isNaN(parsedPrice) ? 0 : parsedPrice,
        description: (formData.description || '').trim(),
        store_id: formData.store_id || null,
        image_url: finalImageUrl,
        is_featured: !!formData.is_featured,
        specs: {
          ...formData.specs,
          store_slug: selectedStore ? (selectedStore.slug || toSlug(selectedStore.name)) : (formData.specs?.store_slug || '')
        }
      };

      console.log('Submitting payload to Supabase:', payload);

      // 4. Database Operation
      // AbortController attempts proper network-level cancellation at 12s
      // (3s before the emergency timer) so PostgreSQL can also cancel the query.
      const controller = new AbortController();
      const abortTimer = setTimeout(() => {
        console.warn('AbortController: cancelling hung Supabase request.');
        controller.abort();
      }, 12000);

      let result;
      try {
        if (product) {
          result = await supabase.from('products').update(payload).eq('id', product.id).select().abortSignal(controller.signal);
        } else {
          result = await supabase.from('products').insert([payload]).select().abortSignal(controller.signal);
        }
      } catch (innerErr) {
        if (innerErr.name === 'AbortError') throw new Error('__timeout__');
        throw innerErr;
      } finally {
        clearTimeout(abortTimer);
      }

      const { data, error } = result;

      if (error) {
        console.error('Supabase Database Error:', error);
        throw new Error(error.message || 'Database operation failed');
      }

      if (!data || data.length === 0) {
        console.warn('Database operation succeeded but no data was returned.');
        onSave(null);
        onClose();
        return;
      }

      console.log('Product saved successfully:', data[0]);
      onSave(data[0]);
      onClose();
    } catch (err) {
      console.error('Submission Failure:', err);
      const msg = err.message || '';
      let userMessage;
      if (msg === '__timeout__' || msg.includes('timed out')) {
        userMessage = 'The request timed out — Supabase did not respond. Please try again.';
      } else if (msg.includes('row-level security') || msg.includes('violates row')) {
        userMessage = 'Permission denied. Your account may not have write access to this catalog.';
      } else if (msg.includes('JWT') || msg.includes('not authenticated') || msg.includes('invalid token')) {
        userMessage = 'Your session has expired. Please sign out and sign back in.';
      } else if (msg.includes('duplicate key') || msg.includes('unique')) {
        userMessage = 'A product with this slug already exists. Please use a different name.';
      } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        userMessage = 'Network error. Check your connection and try again.';
      } else {
        userMessage = msg || 'An unexpected error occurred. Check the console for details.';
      }
      onError?.('Could not save product: ' + userMessage);
    } finally {
      submissionDone = true;
      clearTimeout(emergencyTimer);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '600px', height: '100vh',
      background: '#ffffff', borderLeft: '1px solid var(--studio-border)', boxShadow: '-10px 0 30px rgba(0,0,0,0.02)',
      zIndex: 1000, display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease-out'
    }}>
      <header style={{ padding: '2rem', borderBottom: '1px solid var(--studio-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <h2 className="studio-title" style={{ fontSize: '1.25rem', margin: 0 }}>
          {product ? 'Modify Specification' : 'New Catalog Entry'}
        </h2>
        <button type="button" onClick={onClose} className="studio-btn-icon"><FiX size={20} /></button>
      </header>

      {/* form is a flex column so that flexGrow/shrink work correctly and the submit button stays in the form */}
      <form id="product-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
        <div style={{ padding: '2rem', flexGrow: 1, overflowY: 'auto' }}>
          {/* Image Area */}
          <div style={{ marginBottom: '2.5rem' }}>
            <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Product Visual</label>
            <div 
              className="drop-zone-container"
              onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
              style={{ 
                height: '240px', marginTop: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center',
                overflow: 'hidden', background: '#fcfcfc', border: '1px solid var(--studio-border)', position: 'relative',
                borderRadius: '8px', cursor: 'pointer'
            }}>
              {(previewUrl || formData.image_url) ? (
                <img src={previewUrl || formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--studio-text-muted)' }}>
                  <FiImage size={32} style={{ marginBottom: '1rem', opacity: 0.1 }} />
                  <p style={{ fontSize: '0.75rem' }}>Drop image or click below</p>
                </div>
              )}
              {isDragging && <div style={{ position: 'absolute', inset: 0, background: 'rgba(240, 244, 255, 0.9)', border: '2px dashed #1a1a1b', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20 }}>Drop to Ingest</div>}
              {(uploading || loading) && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 30 }}>Processing...</div>}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={{ border: '1px solid #1a1a1b', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: '#1a1a1b', color: '#ffffff', borderRadius: '6px' }}>
                <FiUpload size={16} /><input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                <span style={{ marginLeft: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>Select Image</span>
              </label>
            </div>
          </div>

          {/* Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Product Name</label>
              <input required className="studio-input" value={formData.name} onChange={handleNameChange} style={{ marginTop: '0.5rem' }} />
            </div>
            <div>
              <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Brand</label>
              <input required className="studio-input" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} style={{ marginTop: '0.5rem' }} />
            </div>
          </div>

          {/* Store must come before Category — it determines which categories are available */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Store Assignment</label>
            <select 
              className="studio-select" required value={formData.store_id}
              onChange={e => {
                const newStoreId = e.target.value;
                const isWorkspace = newStoreId === WORKSPACE_STORE_ID;
                setFormData(prev => ({
                  ...prev, store_id: newStoreId, category_id: '',
                  specs: isWorkspace ? { ...prev.specs, processor: prev.specs.processor || '', memory: prev.specs.memory || '', storage: prev.specs.storage || '', display: prev.specs.display || '' } : prev.specs
                }));
              }}
              style={{ marginTop: '0.5rem' }}
            >
              <option value="">Select Store</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Price (GH₵)</label>
              <input required type="number" className="studio-input" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ marginTop: '0.5rem' }} />
            </div>
            <div>
              <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>
                Category
                {!formData.store_id && <span style={{ marginLeft: '0.5rem', color: 'var(--studio-text-muted)', fontWeight: 400, fontSize: '0.6rem' }}>— select a store first</span>}
              </label>
              <select
                className="studio-select"
                required
                value={formData.category_id}
                onChange={e => setFormData({...formData, category_id: e.target.value})}
                disabled={!formData.store_id}
                style={{ marginTop: '0.5rem', opacity: formData.store_id ? 1 : 0.5 }}
              >
                <option value="">{formData.store_id ? 'Select Category' : 'Select a store first'}</option>
                {availableCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Description</label>
            <textarea className="studio-input" rows="4" style={{ resize: 'none', marginTop: '0.5rem' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          {/* DEDICATED COMPUTING SPECS */}
          {formData.store_id === WORKSPACE_STORE_ID && (
            <div style={{ marginTop: '2.5rem' }}>
              <label className="studio-subtitle" style={{ fontSize: '0.65rem', marginBottom: '1rem', display: 'block' }}>Computing Specifications</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', background: '#fcfcfc', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--studio-border)' }}>
                <div>
                  <label className="studio-subtitle" style={{ fontSize: '0.6rem' }}>Processor</label>
                  <input className="studio-input" value={formData.specs.processor || ''} onChange={e => handleSpecChange('processor', e.target.value)} placeholder="e.g. Apple M3 Pro" style={{ marginTop: '0.4rem' }} />
                </div>
                <div>
                  <label className="studio-subtitle" style={{ fontSize: '0.6rem' }}>Memory (RAM)</label>
                  <input className="studio-input" value={formData.specs.memory || ''} onChange={e => handleSpecChange('memory', e.target.value)} placeholder="e.g. 32GB Unified" style={{ marginTop: '0.4rem' }} />
                </div>
                <div>
                  <label className="studio-subtitle" style={{ fontSize: '0.6rem' }}>Storage (SSD)</label>
                  <input className="studio-input" value={formData.specs.storage || ''} onChange={e => handleSpecChange('storage', e.target.value)} placeholder="e.g. 1TB SSD" style={{ marginTop: '0.4rem' }} />
                </div>
                <div>
                  <label className="studio-subtitle" style={{ fontSize: '0.6rem' }}>Display</label>
                  <input className="studio-input" value={formData.specs.display || ''} onChange={e => handleSpecChange('display', e.target.value)} placeholder="e.g. 14.2-inch Retina" style={{ marginTop: '0.4rem' }} />
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--studio-border)' }}>
            <input type="checkbox" id="featured" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} />
            <label htmlFor="featured" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Featured Collection</label>
          </div>
        </div>

        <footer style={{ padding: '2rem', borderTop: '1px solid var(--studio-border)', display: 'flex', gap: '1rem', flexShrink: 0 }}>
          <button type="submit" form="product-form" className="studio-btn-primary" style={{ flexGrow: 1 }} disabled={loading || uploading}>
            {loading ? 'Processing...' : uploading ? 'Uploading Image...' : 'Authorize Entry'}
          </button>
          <button type="button" onClick={onClose} className="studio-btn-icon" style={{ border: '1px solid var(--studio-border)', padding: '0 1.5rem', borderRadius: '6px' }}>Cancel</button>
        </footer>
      </form>
    </div>
  );
}
