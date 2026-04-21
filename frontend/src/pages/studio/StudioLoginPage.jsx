import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { supabase } from '../../lib/supabase';
import { FcGoogle } from 'react-icons/fc';
import logoFull from '../../assets/logos/logo-full.png';
import '../../styles/admin.css';

export default function StudioLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { addNotification } = useNotification();
  const from = location.state?.from?.pathname || '/studio';
  
  const notifiedUserRef = useRef(null);

  // 1. Redirect if authorized
  useEffect(() => {
    if (user && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [user, isAdmin, navigate, from]);

  // 2. Handle unauthorized state
  useEffect(() => {
    if (user && !isAdmin && !authLoading) {
      setError("Access Denied. Your account is not on the administrator whitelist.");
      
      // Only notify once per user attempt to prevent duplication/looping during signOut
      if (notifiedUserRef.current !== user.id) {
        addNotification({
          title: 'SECURITY ALERT',
          message: 'Unauthorized access attempt detected.',
          type: 'error'
        });
        notifiedUserRef.current = user.id;
      }

      // Automatically sign out to prevent stuck unauthorized session
      signOut();
    } else if (!user) {
      // Clear the ref when user is null (signed out or start state)
      notifiedUserRef.current = null;
    }
  }, [user, isAdmin, authLoading, addNotification, signOut]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error: err } = await signInWithGoogle();

    if (err) {
      setError(err.message);
      setLoading(false);
    }
    // No need to navigate here because OAuth redirects away and back
  };

  return (
    <div className="studio-main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fcfcfc' }}>
      <div className="studio-glass" style={{ padding: '4rem 3rem', width: '100%', maxWidth: '440px', border: '1px solid #eee' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <img src={logoFull} alt="RhaySource" style={{ width: '100%', maxWidth: '180px', marginBottom: '1.5rem' }} />
          <p className="studio-subtitle" style={{ fontSize: '0.65rem' }}>Administrative Gateway</p>
        </div>

        {error && (
          <div style={{ color: 'var(--studio-error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleGoogleLogin}
            className="google-btn"
            disabled={loading}
          >
            {loading ? 'Connecting...' : (
              <>
                <FcGoogle style={{ fontSize: '1.4rem' }} />
                Continue with Google
              </>
            )}
          </button>
          <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--studio-text)', opacity: 0.6 }}>
            Secure access for authorized RhaySource administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
