import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useProductStore } from '../store/useProductStore';

/**
 * Hook to fetch products for a specific store slug or all products.
 * Now uses a global session cache (Zustand) to avoid constant DB hits.
 */
export function useProducts(storeSlug = null) {
  const {
    products: allProducts,
    stores: cachedStores,
    loading,
    error,
    fetchAllProducts,
    fetchStoreMetadata
  } = useProductStore();

  // 1. Trigger fetch on mount/slug change if needed
  useEffect(() => {
    fetchAllProducts();
    if (storeSlug && !cachedStores[storeSlug]) {
      fetchStoreMetadata(storeSlug);
    }
  }, [storeSlug, fetchAllProducts, fetchStoreMetadata, cachedStores]);

  // 2. Filter products locally based on storeSlug
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const isActive = p.stores?.is_active !== false;
      const matchesSlug = !storeSlug || p.stores?.slug === storeSlug;
      return isActive && matchesSlug;
    });
  }, [allProducts, storeSlug]);

  return { 
    products: filteredProducts, 
    store: storeSlug ? cachedStores[storeSlug] : null, 
    loading, 
    error, 
    refetch: () => fetchAllProducts(true) 
  };
}

/**
 * Hook to fetch a single product by ID or Slug.
 * Efficiently uses the global shop session cache if available.
 */
export function useProduct(idOrSlug) {
  const { products: allProducts, fetchAllProducts, updateProductInCache } = useProductStore();
  const [localProduct, setLocalProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Try to find product in the global store's existing catalog
  const cachedProduct = useMemo(() => {
    if (!idOrSlug) return null;
    return allProducts.find(p => p.id === idOrSlug || p.id === parseInt(idOrSlug) || p.slug === idOrSlug);
  }, [allProducts, idOrSlug]);

  useEffect(() => {
    async function fetchProduct() {
      if (!idOrSlug || cachedProduct) return;
      
      setLoading(true);
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);
        let query = supabase.from('products').select('*, stores(*)').eq('stores.is_active', true);
        
        if (isUuid) {
          query = query.eq('id', idOrSlug);
        } else {
          query = query.eq('slug', idOrSlug);
        }

        const { data, error: err } = await query.single();
        if (err) throw err;
        
        setLocalProduct(data);
        // Optional: Update the global cache if this was a fresh discovery
        updateProductInCache(data);
      } catch (err) {
        console.error('❌ Hook Error: Failed to fetch product:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    // If global store is empty, trigger the initial fetch
    if (allProducts.length === 0) {
      fetchAllProducts();
    } else {
      fetchProduct();
    }
  }, [idOrSlug, cachedProduct, allProducts.length, fetchAllProducts, updateProductInCache]);

  return { 
    product: cachedProduct || localProduct, 
    loading: loading || (allProducts.length === 0 && !cachedProduct), 
    error 
  };
}
