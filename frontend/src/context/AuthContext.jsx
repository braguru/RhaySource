import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);

  const fetchProfile = async (email) => {
    if (!email) return;
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (!error && data) {
      setProfile(data);
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      setProfile(null);
      if (error && error.code !== 'PGRST116') {
        console.error('Admin check error:', error.message);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    // 1. Initial Session Check (Force determining state immediately)
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await fetchProfile(currentUser.email);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // 2. Continuous State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        console.log(`[Auth] State Change: ${event}`);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.email);
        } else {
          setIsAdmin(false);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async (updates) => {
    if (!user) return { error: 'Not authenticated' };

    // 1. If email is changing, update Auth first
    if (updates.email && updates.email !== user.email) {
      const { error: authError } = await supabase.auth.updateUser({ email: updates.email });
      if (authError) return { error: authError.message };
    }

    // 2. Update admin_users record
    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single();

    if (!error) {
      setProfile(data);
      return { data };
    }
    return { error: error.message };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error.message);
    }
  };

  const signInWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/studio`
      }
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, isAdmin, loading, 
      updateProfile, signOut, fetchProfile, 
      signInWithGoogle 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
