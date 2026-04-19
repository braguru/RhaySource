import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import StudioLoader from '../../components/admin/StudioLoader';
import { 
  FiSave, FiUser, FiMail, FiGlobe, FiTool, FiCheck, FiCamera, FiUpload,
  FiRefreshCw, FiClock, FiSettings, FiShield, FiSmartphone 
} from 'react-icons/fi';
import '../../styles/admin.css';

export default function StudioSettingsPage() {
  const { profile, updateProfile, fetchProfile, user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  
  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState({});
  const [lastUpdated, setLastUpdated] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [activeBroadcast, setActiveBroadcast] = useState('global');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // Local Profile State (for editing)
  const [localProfile, setLocalProfile] = useState({
    display_name: '',
    email: '',
    avatar_url: ''
  });

  useEffect(() => {
    fetchGlobalSettings();
    if (profile) {
      setLocalProfile({
        display_name: profile.display_name || '',
        email: profile.email || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  async function fetchGlobalSettings() {
    setLoading(true);
    const { data, error } = await supabase.from('settings').select('*');
    if (!error && data) {
      const settingsMap = {};
      const timeMap = {};
      data.forEach(s => { 
        settingsMap[s.key] = s.value; 
        timeMap[s.key] = s.updated_at;
      });
      setGlobalSettings(settingsMap);
      setLastUpdated(timeMap);
    }
    setLoading(false);
  }

  const handleGlobalUpdate = (key, value) => {
    setGlobalSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveGlobalKey = useCallback(async (key) => {
    setSaving(key);
    console.log(`[Studio] Saving ${key}...`, globalSettings[key]);
    
    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert({ key, value: globalSettings[key] }, { onConflict: 'key' })
        .select();

      if (!error) {
        if (data?.[0]) {
          setLastUpdated(prev => ({ ...prev, [key]: data[0].updated_at }));
        }
        setStatusMessage({ text: `${key.replace('_', ' ').toUpperCase()} updated successfully.`, type: 'success' });
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
      } else {
        throw error;
      }
    } catch (err) {
      console.error(`[Studio] ${key} save error:`, err);
      setStatusMessage({ text: `Update failed: ${err.message}`, type: 'error' });
    } finally {
      setSaving(null);
    }
  }, [globalSettings]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    await uploadToCloudinary(file, 'rhaysource/avatars', (url) => {
      setLocalProfile(prev => ({ ...prev, avatar_url: url }));
      setStatusMessage({ text: 'Avatar uploaded. Click "Update Account" to save changes.', type: 'success' });
    });
    setUploadingAvatar(false);
  };

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    await uploadToCloudinary(file, 'rhaysource/branding', (url) => {
      handleGlobalUpdate('branding', { ...globalSettings.branding, brand_logo_url: url });
      setStatusMessage({ text: 'Brand Logo ingested. Remember to Sync Brand.', type: 'success' });
    });
    setUploadingLogo(false);
  };

  const uploadToCloudinary = async (file, targetFolder, onSuccess) => {
    try {
      const signResponse = await fetch(`/api/images/sign?folder=${targetFolder}`, { method: 'POST' });
      if (!signResponse.ok) throw new Error('Failed to generate secure signature.');
      const { signature, timestamp, cloud_name, api_key, folder, upload_preset } = await signResponse.json();

      const uploadPayload = new FormData();
      uploadPayload.append('file', file);
      uploadPayload.append('signature', signature);
      uploadPayload.append('timestamp', timestamp);
      uploadPayload.append('api_key', api_key);
      uploadPayload.append('upload_preset', upload_preset);
      uploadPayload.append('folder', folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        { method: 'POST', body: uploadPayload }
      );
      
      const uploadData = await uploadResponse.json();
      if (uploadData.secure_url) {
        onSuccess(uploadData.secure_url);
      } else {
        throw new Error(uploadData.error?.message || 'Cloudinary upload failed.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setStatusMessage({ text: `Upload failed: ${err.message}`, type: 'error' });
    }
  };

  const saveMyProfile = async () => {
    setSaving('profile');
    const result = await updateProfile(localProfile);
    if (!result.error) {
      setStatusMessage({ text: 'Your personal profile has been synchronized.', type: 'success' });
      setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
    } else {
      setStatusMessage({ text: `Profile error: ${result.error}`, type: 'error' });
    }
    setSaving(null);
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'Never';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <StudioLoader message="Auditing Global Metadata..." />;

  return (
    <AdminLayout title="Studio Settings">
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid var(--studio-border)' }}>
        <button 
          onClick={() => setActiveTab('account')}
          style={{ 
            padding: '1rem 0', 
            background: 'none', 
            border: 'none', 
            color: activeTab === 'account' ? 'var(--studio-text)' : 'var(--studio-text-muted)',
            fontWeight: activeTab === 'account' ? '700' : '500',
            borderBottom: activeTab === 'account' ? '2px solid var(--studio-accent)' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'all 0.2s'
          }}
        >
          <FiUser style={{ marginRight: '8px' }} /> My Account
        </button>
        <button 
          onClick={() => setActiveTab('storefront')}
          style={{ 
            padding: '1rem 0', 
            background: 'none', 
            border: 'none', 
            color: activeTab === 'storefront' ? 'var(--studio-text)' : 'var(--studio-text-muted)',
            fontWeight: activeTab === 'storefront' ? '700' : '500',
            borderBottom: activeTab === 'storefront' ? '2px solid var(--studio-accent)' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'all 0.2s'
          }}
        >
          <FiSmartphone style={{ marginRight: '8px' }} /> Storefront Details
        </button>
        <button 
          onClick={() => setActiveTab('ops')}
          style={{ 
            padding: '1rem 0', 
            background: 'none', 
            border: 'none', 
            color: activeTab === 'ops' ? 'var(--studio-text)' : 'var(--studio-text-muted)',
            fontWeight: activeTab === 'ops' ? '700' : '500',
            borderBottom: activeTab === 'ops' ? '2px solid var(--studio-accent)' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'all 0.2s'
          }}
        >
          <FiShield style={{ marginRight: '8px' }} /> Site Alerts & Social
        </button>
      </div>

      {statusMessage.text && (
        <div style={{ 
          padding: '1rem 2rem', 
          borderRadius: '8px', 
          marginBottom: '2rem',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          backgroundColor: statusMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: statusMessage.type === 'success' ? '#16a34a' : '#dc2626',
          border: '1px solid currentColor',
          animation: 'fadeIn 0.3s'
        }}>
          <FiCheck /> {statusMessage.text}
        </div>
      )}

      {/* TAB 1: MY ACCOUNT */}
      {activeTab === 'account' && (
        <div style={{ maxWidth: '800px' }}>
          <section className="studio-glass" style={{ padding: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Personal Identity</h3>
                <p style={{ color: 'var(--studio-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Manage your individual display name, role, and administrative email.</p>
              </div>
              <button className="studio-btn-primary" onClick={saveMyProfile} disabled={saving === 'profile'}>
                {saving === 'profile' ? 'Updating...' : 'Update Account'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  overflow: 'hidden', 
                  background: '#f8fafc', 
                  border: '2px solid var(--studio-border)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  {uploadingAvatar ? (
                    <div className="upload-spinner-small"></div>
                  ) : localProfile.avatar_url ? (
                    <img src={localProfile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <FiUser size={40} style={{ color: 'var(--studio-text-muted)' }} />
                  )}
                </div>
                <label style={{ 
                  position: 'absolute', 
                  bottom: '5px', 
                  right: '5px', 
                  background: 'var(--studio-accent)', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '2px solid #fff'
                }}>
                  <FiCamera size={14} style={{ color: '#000' }} />
                  <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                </label>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--studio-text-muted)', marginTop: '1rem' }}>
                {uploadingAvatar ? 'Ingesting Visual...' : 'Click or drop a photo to update your avatar'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="studio-subtitle">Display Name</label>
                <input 
                  className="studio-input" 
                  value={localProfile.display_name}
                  onChange={e => setLocalProfile({...localProfile, display_name: e.target.value})}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="studio-subtitle">Login & System Email</label>
                <input 
                  className="studio-input" 
                  value={localProfile.email}
                  onChange={e => setLocalProfile({...localProfile, email: e.target.value})}
                  placeholder="admin@rhaysource.com"
                />
                <p style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '0.5rem', fontWeight: '600' }}>
                  Warning: Changing your email will require re-verification on your next login.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: STOREFRONT DETAILS */}
      {activeTab === 'storefront' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Identity & Logo */}
          <section className="studio-glass" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Brand Identity</h3>
              <button 
                className="studio-btn-primary" 
                onClick={() => saveGlobalKey('branding')} 
                disabled={saving === 'branding'}
              >
                Sync Brand
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '100px', 
                  height: '60px', 
                  background: '#f8fafc', 
                  border: '2px dashed var(--studio-border)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden'
                }}>
                  {uploadingLogo ? (
                    <div className="upload-spinner-small"></div>
                  ) : globalSettings.branding?.brand_logo_url ? (
                    <img src={globalSettings.branding.brand_logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <FiUpload size={20} style={{ color: 'var(--studio-text-muted)' }} />
                  )}
                </div>
                <label style={{ 
                  position: 'absolute', 
                  top: '-8px', 
                  right: '-8px', 
                  background: 'var(--studio-accent)', 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  border: '2px solid #fff'
                }}>
                   <FiCamera size={10} style={{ color: '#000' }} />
                   <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                </label>
              </div>
              <div style={{ flex: 1 }}>
                <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Brand Logo</label>
                <p style={{ fontSize: '0.7rem', color: 'var(--studio-text-muted)', margin: 0 }}>Prefer transparent PNG or SVG for best rendering.</p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="studio-subtitle">Official Brand Name</label>
              <input 
                className="studio-input" 
                placeholder="RhaySource Premium"
                value={globalSettings.branding?.brand_name || ''}
                onChange={e => handleGlobalUpdate('branding', { ...globalSettings.branding, brand_name: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="studio-subtitle">Editorial Tagline</label>
              <input 
                className="studio-input" 
                placeholder="The Apex of Lifestyle"
                value={globalSettings.branding?.tagline || ''}
                onChange={e => handleGlobalUpdate('branding', { ...globalSettings.branding, tagline: e.target.value })}
              />
            </div>
          </section>

          {/* Global Commerce Settings */}
          <section className="studio-glass" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Global Commerce</h3>
              <button 
                className="studio-btn-primary" 
                onClick={() => saveGlobalKey('commerce')} 
                disabled={saving === 'commerce'}
              >
                Sync Rules
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="studio-subtitle">Base Currency</label>
                <select 
                  className="studio-select"
                  value={globalSettings.commerce?.currency || 'GHS'}
                  onChange={e => handleGlobalUpdate('commerce', { ...globalSettings.commerce, currency: e.target.value })}
                >
                  <option value="GHS">GHS (GH₵)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div>
                <label className="studio-subtitle">Tax Rate (%)</label>
                <input 
                  type="number"
                  className="studio-input" 
                  placeholder="0"
                  value={globalSettings.commerce?.tax_rate || ''}
                  onChange={e => handleGlobalUpdate('commerce', { ...globalSettings.commerce, tax_rate: e.target.value })}
                />
              </div>
            </div>
            <div style={{ marginBottom: '2.5rem' }}>
              <label className="studio-subtitle">Free Shipping Threshold</label>
              <input 
                type="number"
                className="studio-input" 
                placeholder="e.g. 500"
                value={globalSettings.commerce?.free_shipping_threshold || ''}
                onChange={e => handleGlobalUpdate('commerce', { ...globalSettings.commerce, free_shipping_threshold: e.target.value })}
              />
            </div>

            <div style={{ borderTop: '1px solid var(--studio-border)', paddingTop: '2rem' }}>
               <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', marginBottom: '1rem' }}>Support & Logistics</h4>
               <div style={{ marginBottom: '1rem' }}>
                  <label className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Store Support Email</label>
                  <input 
                    className="studio-input" 
                    value={globalSettings.communication?.admin_email || ''}
                    onChange={e => handleGlobalUpdate('communication', { ...globalSettings.communication, admin_email: e.target.value })}
                  />
               </div>
               <button 
                className="studio-btn-primary" 
                style={{ width: '100%', fontSize: '0.65rem', padding: '0.6rem' }}
                onClick={() => saveGlobalKey('communication')} 
                disabled={saving === 'communication'}
               >
                 Sync Contact Info
               </button>
            </div>
          </section>

          <section className="studio-glass" style={{ padding: '2.5rem', gridColumn: 'span 2' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>Physical Registry</h3>
            <p style={{ color: 'var(--studio-text-muted)', fontSize: '0.85rem' }}>The official headquarters address displayed on invoices and footer data.</p>
            <textarea 
              className="studio-input" 
              style={{ marginTop: '1.5rem', minHeight: '80px', resize: 'none' }}
              placeholder="Store Address / Headquarters"
              value={globalSettings.communication?.address || ''}
              onChange={e => handleGlobalUpdate('communication', { ...globalSettings.communication, address: e.target.value })}
            />
          </section>
        </div>
      )}

      {/* TAB 3: SITE ALERTS & SOCIAL */}
      {activeTab === 'ops' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <section className="studio-glass" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Social Media Links</h3>
              <button className="studio-btn-primary" onClick={() => saveGlobalKey('social_links')} disabled={saving === 'social_links'}>
                Update Links
              </button>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="studio-subtitle">Instagram Handle</label>
              <input 
                className="studio-input" 
                value={globalSettings.social_links?.instagram || ''}
                onChange={e => handleGlobalUpdate('social_links', { ...globalSettings.social_links, instagram: e.target.value })}
              />
            </div>
            <div>
              <label className="studio-subtitle">WhatsApp Link</label>
              <input 
                className="studio-input" 
                value={globalSettings.social_links?.whatsapp || ''}
                onChange={e => handleGlobalUpdate('social_links', { ...globalSettings.social_links, whatsapp: e.target.value })}
              />
            </div>
          </section>

          <section className="studio-glass" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Global Broadcast Center</h3>
              <button 
                className="studio-btn-primary" 
                style={{ background: '#000', color: '#fff' }}
                onClick={() => saveGlobalKey('broadcasts')} 
                disabled={saving === 'broadcasts'}
              >
                Push Broadcast
              </button>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <label className="studio-subtitle">Visibility Scope</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                {['global', 'skincare', 'home-living', 'workspace'].map(target => (
                  <button
                    key={target}
                    onClick={() => setActiveBroadcast(target)}
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      fontSize: '0.65rem',
                      borderRadius: '6px',
                      border: '1px solid var(--studio-border)',
                      background: activeBroadcast === target ? 'var(--studio-accent)' : '#fff',
                      color: activeBroadcast === target ? '#000' : 'var(--studio-text-muted)',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {target}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700' }}>Enable Marquee</p>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={globalSettings.broadcasts?.[activeBroadcast]?.is_active || false}
                    onChange={e => {
                      const current = globalSettings.broadcasts || {};
                      handleGlobalUpdate('broadcasts', { 
                        ...current, 
                        [activeBroadcast]: { ...(current[activeBroadcast] || {}), is_active: e.target.checked }
                      });
                    }}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <textarea 
                className="studio-input" 
                style={{ minHeight: '80px', resize: 'none', marginBottom: '1rem' }}
                placeholder={`Announcement for ${activeBroadcast}...`}
                value={globalSettings.broadcasts?.[activeBroadcast]?.text || ''}
                onChange={e => {
                  const current = globalSettings.broadcasts || {};
                  handleGlobalUpdate('broadcasts', { 
                    ...current, 
                    [activeBroadcast]: { ...(current[activeBroadcast] || {}), text: e.target.value }
                  });
                }}
              />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label className="studio-subtitle" style={{ margin: 0 }}>Theme:</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[
                    { name: 'Gold', color: '#ffca28' },
                    { name: 'Blue', color: '#1e3a8a' },
                    { name: 'Red', color: '#dc2626' },
                    { name: 'Black', color: '#000000' }
                  ].map(theme => (
                    <button
                      key={theme.name}
                      onClick={() => {
                        const current = globalSettings.broadcasts || {};
                        handleGlobalUpdate('broadcasts', { 
                          ...current, 
                          [activeBroadcast]: { ...(current[activeBroadcast] || {}), color: theme.color }
                        });
                      }}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        background: theme.color,
                        border: (globalSettings.broadcasts?.[activeBroadcast]?.color === theme.color) ? '2px solid #fff' : '1px solid #ccc',
                        boxShadow: (globalSettings.broadcasts?.[activeBroadcast]?.color === theme.color) ? '0 0 0 2px var(--studio-accent)' : 'none',
                        cursor: 'pointer'
                      }}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem', background: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700' }}>Maintenance Mode</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Restrict public storefront access.</p>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={globalSettings.system_status?.maintenance_mode || false}
                  onChange={e => handleGlobalUpdate('system_status', { ...globalSettings.system_status, maintenance_mode: e.target.checked })}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </section>
        </div>
      )}

      <footer style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid var(--studio-border)', opacity: 0.5, fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>STUDIO GOVERNANCE v2.0</div>
        <div>SESSION: {user?.id.substring(0, 8)}</div>
      </footer>
    </AdminLayout>
  );
}
