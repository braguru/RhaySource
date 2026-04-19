import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook to fetch products for a specific store slug or all products
 */
export function useProducts(storeSlug = null) {
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null); // Metadata for the requested store
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch products with store join
      let query = supabase
        .from('products')
        .select('*, stores(slug, is_active)');

      // 2. Fetch store metadata if a slug is provided
      if (storeSlug) {
        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', storeSlug)
          .single();
        if (storeData) setStore(storeData);
      }
      const { data, error: err } = await query.order('sort_order', { ascending: true });

      if (err) throw err;
      
      // Filter by storeSlug if provided AND ensure store is active for public site
      const filteredData = data.filter(p => {
        const isActive = p.stores?.is_active !== false; // Default to true if not present, but usually explicit
        const matchesSlug = !storeSlug || p.stores?.slug === storeSlug;
        return isActive && matchesSlug;
      });

      setProducts(filteredData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [storeSlug]);

  useEffect(() => {
    fetchProducts();

    // Set up Realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, and DELETE
          schema: 'public',
          table: 'products'
        },
        () => {
          console.log('✨ Realtime update detected, refreshing pieces...');
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  return { products, store, loading, error, refetch: fetchProducts };
}

/**
 * Hook to fetch a single product by ID or Slug
 */
export function useProduct(idOrSlug) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!idOrSlug) return;
      setLoading(true);
      try {
        // Try filtering by ID if it's a UUID, otherwise by slug
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);
        
        let query = supabase.from('products').select('*, stores(*)').eq('stores.is_active', true);
        
        if (isUuid) {
          query = query.eq('id', idOrSlug);
        } else {
          // Note: Products currently don't have a slug column in schema.sql, 
          // but this logic supports it if added later.
          query = query.eq('slug', idOrSlug);
        }

        const { data, error: err } = await query.single();

        if (err) throw err;
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [idOrSlug]);

  return { product, loading, error };
}
