import React from 'react';
import logoFull from '../../assets/logos/logo-full.png';

/**
 * StudioLoader - Premium Administrative Initialization UI
 * Features:
 * - High-fidelity "Noir" theme
 * - Pulsing brand mark
 * - Branded typography
 */
const StudioLoader = ({ message = 'Initializing Administrative Repository...' }) => {
  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#ffffff',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      {/* Brand Mark Container */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem'
      }}>
        {/* Pulsing Aura - Light Variant */}
        <div className="loader-aura-light" />
        
        {/* Logo - Full Color */}
        <img 
          src={logoFull} 
          alt="RhaySource" 
          style={{ 
            width: '240px', 
            height: 'auto', 
            marginBottom: '4rem',
            position: 'relative',
            zIndex: 2
          }} 
        />

        {/* Status Line */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div className="loader-bar-light" />
          <p style={{ 
            fontFamily: 'Inter, sans-serif', 
            fontSize: '0.7rem', 
            fontWeight: '700', 
            color: '#1a1a1b', 
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            opacity: 0.6
          }}>
            {message}
          </p>
        </div>
      </div>

      <style>{`
        .loader-aura-light {
          position: absolute;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(254, 187, 0, 0.08) 0%, rgba(255,255,255,0) 70%);
          animation: pulse-light 3s infinite ease-in-out;
        }

        .loader-bar-light {
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #FEBB00, transparent);
          animation: load-light 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes pulse-light {
          0%, 100% { transform: scale(0.9); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes load-light {
          0% { width: 0; opacity: 0; transform: translateX(-50px); }
          50% { width: 140px; opacity: 1; transform: translateX(0); }
          100% { width: 0; opacity: 0; transform: translateX(50px); }
        }
      `}</style>
    </div>
  );
};

export default StudioLoader;
