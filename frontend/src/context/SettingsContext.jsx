import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    system_status: { maintenance_mode: false },
    social_links: {},
    communication: {},
    branding: { brand_name: '', tagline: '', announcement_text: '', is_announcement_active: false },
    commerce: { currency: 'GHS', tax_rate: '', free_shipping_threshold: '' },
    broadcasts: {
      global: { text: '', is_active: false },
      skincare: { text: '', is_active: false },
      workspace: { text: '', is_active: false },
      'home-living': { text: '', is_active: false }
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Load
    async function loadSettings() {
      const { data } = await supabase.from('settings').select('*');
      if (data) {
        const mapped = {};
        data.forEach(s => { mapped[s.key] = s.value; });
        setSettings(prev => ({ ...prev, ...mapped }));
      }
      setLoading(false);
    }

    loadSettings();

    // 2. Real-time Subscription (SINGLETON)
    const channel = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: '*', table: 'settings' }, (payload) => {
        const { key, value } = payload.new;
        setSettings(prev => ({ ...prev, [key]: value }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};
