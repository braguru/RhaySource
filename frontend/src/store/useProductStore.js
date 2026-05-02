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
  loadingStartedAt: null,
  isRealtimeActive: false,

  /**
   * Fetches the entire product catalog if not already in session.
   * Forces a refresh if forced=true or if cache is older than TTL.
   */
  fetchAllProducts: async (forced = false) => {
    const { products, lastFetched, loading, loadingStartedAt } = get();

    const now = Date.now();
    // If loading has been true for more than 10 seconds the request likely hung —
    // allow a new attempt rather than blocking forever.
    const isLoadingStuck = loading && loadingStartedAt && (now - loadingStartedAt > 10000);

    if (loading && !isLoadingStuck) return;

    // Cache is only valid if we actually have products AND it's recent (TTL: 2 minutes).
    // If products is empty we NEVER treat it as a valid cache — empty could mean the
    // session wasn't ready on first mount (RLS timing race) and we got 0 rows back.
    const isCacheValid = products.length > 0 && lastFetched && (now - lastFetched < 2 * 60 * 1000);
    if (isCacheValid && !forced) return;

    // Stamp this request — used to discard the result if a newer request overtook it
    const fetchStartedAt = now;
    set({ loading: true, error: null, loadingStartedAt: fetchStartedAt });

    try {
      const { data, error: err } = await supabase
        .from('products')
        .select('*, stores(slug, is_active, name, label)')
        .order('sort_order', { ascending: true });

      if (err) throw err;

      // Discard stale responses if a newer request has already started
      if (get().loadingStartedAt === fetchStartedAt) {
        set({
          products: data ?? [],
          lastFetched: data && data.length > 0 ? Date.now() : null,
          loading: false,
          loadingStartedAt: null
        });
      }
    } catch (err) {
      console.error('❌ Store Error: Failed to fetch products:', err.message);
      if (get().loadingStartedAt === fetchStartedAt) {
        set({ error: err.message, loading: false, loadingStartedAt: null });
      }
    } finally {
      // Always ensure Realtime is running so live changes self-heal a bad initial load
      get().initializeRealtime();
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

    // Debounce the refetch so a burst of rapid changes (e.g. an admin save
    // that immediately triggers Realtime) doesn't compete for pool slots with
    // the write that caused the event.
    let realtimeDebounceTimer = null;

    const channel = supabase
      .channel('global-catalog-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('🔄 Session Cache: Realtime update received', payload);
          clearTimeout(realtimeDebounceTimer);
          realtimeDebounceTimer = setTimeout(() => {
            get().fetchAllProducts(true);
          }, 1500);
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
