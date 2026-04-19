import { create } from 'zustand';
import { supabase } from '../lib/supabase';

/**
 * Global Store for Product Data
 * Provides session caching, deduplicated filtering, and centralized Realtime sync.
 */
export const useProductStore = create((set, get) => ({
  products: [],
  stores: {}, // Cache for store metadata, keyed by slug
  loading: false,
  error: null,
  lastFetched: null,
  isRealtimeActive: false,

  /**
   * Fetches the entire product catalog if not already in session.
   * Forces a refresh if forced=true or if cache is older than TTL.
   */
  fetchAllProducts: async (forced = false) => {
    const { products, lastFetched, loading } = get();
    
    // Skip if already loading
    if (loading) return;

    // Use cache if available and not forced (TTL: 5 minutes)
    const now = Date.now();
    const isCacheValid = lastFetched && (now - lastFetched < 5 * 60 * 1000);
    
    if (products.length > 0 && isCacheValid && !forced) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const { data, error: err } = await supabase
        .from('products')
        .select('*, stores(slug, is_active, name, label)')
        .order('sort_order', { ascending: true });

      if (err) throw err;

      set({ 
        products: data, 
        lastFetched: Date.now(), 
        loading: false 
      });

      // Automatically start Realtime if not active
      get().initializeRealtime();
    } catch (err) {
      console.error('❌ Store Error: Failed to fetch products:', err.message);
      set({ error: err.message, loading: false });
    }
  },

  /**
   * Fetches metadata for a specific store and caches it.
   */
  fetchStoreMetadata: async (slug) => {
    if (!slug) return;
    const { stores } = get();
    
    if (stores[slug]) return stores[slug];

    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;

      set((state) => ({
        stores: { ...state.stores, [slug]: data }
      }));
      
      return data;
    } catch (err) {
      console.error(`❌ Store Error: Failed to fetch metadata for ${slug}:`, err.message);
      return null;
    }
  },

  /**
   * Initializes a single global Realtime subscription for the products table.
   */
  initializeRealtime: () => {
    if (get().isRealtimeActive) return;

    const channel = supabase
      .channel('global-catalog-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('🔄 Session Cache: Realtime update received', payload);
          // Instead of refetching everything, we could update the array locally,
          // but for consistency with complex joins, we'll just trigger a refresh.
          get().fetchAllProducts(true);
        }
      )
      .subscribe();

    set({ isRealtimeActive: true });

    return () => {
      supabase.removeChannel(channel);
      set({ isRealtimeActive: false });
    };
  },

  /**
   * Updates a single product in the cache (useful for optimistic UI or detail fetches)
   */
  updateProductInCache: (updatedProduct) => {
    set((state) => ({
      products: state.products.map((p) => 
        p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
      )
    }));
  }
}));
