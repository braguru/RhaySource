import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiPackage, FiLogOut, FiExternalLink, FiUser, FiSettings, FiLayers, FiArchive } from 'react-icons/fi';
import logoFull from '../../assets/logos/logo-full.png';
import '../../styles/admin.css';

const AdminLayout = ({ children, title }) => {
  const { signOut, user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', icon: FiGrid, path: '/studio' },
    { label: 'Inventory', icon: FiPackage, path: '/studio/products' },
    { label: 'Categories', icon: FiLayers, path: '/studio/categories' },
    { label: 'Stores', icon: FiArchive, path: '/studio/stores' },
    { label: 'Settings', icon: FiSettings, path: '/studio/settings' },
  ];

  return (
    <div className="studio-main" style={{ display: 'flex' }}>
      {/* Sidebar */}
      <aside className="studio-sidebar" style={{
        width: 'var(--studio-sidebar-width)',
        height: '100vh',
        borderRight: '1px solid var(--studio-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        background: 'var(--studio-sidebar)',
        zIndex: 100
      }}>
        <div style={{ padding: '2.5rem 2rem', borderBottom: '1px solid var(--studio-border)', textAlign: 'center' }}>
          <img src={logoFull} alt="RhaySource" style={{ width: '100%', maxWidth: '160px' }} />
          <p className="studio-subtitle" style={{ color: 'var(--studio-sidebar-text)', marginTop: '1rem', fontSize: '0.6rem', opacity: 0.5 }}>Studio Manager</p>
        </div>

        <nav style={{ padding: '2rem 1rem', flexGrow: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {navItems.map((item) => (
              <li key={item.label} style={{ marginBottom: '0.5rem' }}>
                <Link
                  to={item.disabled ? '#' : item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '8px',
                    color: location.pathname === item.path ? '#000' : (item.disabled ? '#d1d5db' : 'var(--studio-text-muted)'),
                    textDecoration: 'none',
                    backgroundColor: location.pathname === item.path ? 'var(--studio-accent)' : 'transparent',
                    transition: 'var(--studio-transition)',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: location.pathname === item.path ? '600' : '400'
                  }}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ padding: '2rem', borderTop: '1px solid var(--studio-border)', background: 'var(--studio-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', // Premium Circular Avatar
              overflow: 'hidden',
              background: '#ffffff', 
              border: '1px solid var(--studio-border)',
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              color: 'var(--studio-sidebar-text)',
              flexShrink: 0
            }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FiUser size={18} />
              )}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--studio-text)', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontWeight: '700', textTransform: 'capitalize' }}>
                {profile?.display_name || 'Principal'}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--studio-text-muted)', margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {user?.email || 'Administrator'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleSignOut}
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '0.75rem 1rem', 
              background: '#fff5f5', 
              border: '1px solid #ffebeb', 
              borderRadius: '6px',
              color: '#ef4444', 
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '500',
              transition: 'var(--studio-transition)'
            }}
          >
            <FiLogOut size={16} />
            <span>End Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        marginLeft: 'var(--studio-sidebar-width)', 
        flexGrow: 1, 
        padding: '3.5rem',
        minHeight: '100vh',
        background: 'var(--studio-bg)'
      }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '4rem',
          borderBottom: '1px solid var(--studio-border)',
          paddingBottom: '2rem'
        }}>
          <div>
            <h1 className="studio-title" style={{ margin: 0 }}>{title}</h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--studio-text)', marginTop: '0.5rem' }}>
              Management Suite & Repository
            </p>
          </div>
          <Link to="/" target="_blank" style={{ 
            color: 'var(--studio-text)', 
            textDecoration: 'none', 
            fontSize: '0.8rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            background: 'var(--studio-surface-raised)',
            border: '1px solid var(--studio-border)',
            borderRadius: '100px',
            transition: 'var(--studio-transition)'
          }}
          className="visit-link"
          >
            Live Shop <FiExternalLink size={14} />
          </Link>
        </header>

        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
