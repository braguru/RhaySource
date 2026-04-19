import React, { useEffect } from 'react';
import { useLocation, BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import { CartProvider, useCart } from './context/CartContext';
import { TechCartProvider, useTechCart } from './context/TechCartContext';
import { HomeLivingCartProvider, useHomeLivingCart } from './context/HomeLivingCartContext';
import CartDrawer from './components/features/CartDrawer';
import WorkspaceCartDrawer from './components/features/WorkspaceCartDrawer';
import HomeLivingCartDrawer from './components/features/HomeLivingCartDrawer';
import WorkspacePage from './pages/WorkspacePage';
import WorkspaceShopPage from './pages/WorkspaceShopPage';
import WorkspaceAboutPage from './pages/WorkspaceAboutPage';
import WorkspaceProductDetailPage from './pages/WorkspaceProductDetailPage';
import HomeLivingPage from './pages/HomeLivingPage';
import HomeLivingShopPage from './pages/HomeLivingShopPage';
import HomeLivingProductDetailPage from './pages/HomeLivingProductDetailPage';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import StudioLoginPage from './pages/studio/StudioLoginPage';
import StudioDashboard from './pages/studio/StudioDashboard';
import StudioProductsPage from './pages/studio/StudioProductsPage';
import StudioStoresPage from './pages/studio/StudioStoresPage';
import StudioCategoriesPage from './pages/studio/StudioCategoriesPage';
import StudioSettingsPage from './pages/studio/StudioSettingsPage';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationToastContainer } from './components/common/NotificationToast.jsx';
import './App.css';

import { useSettings } from './hooks/useSettings';

function AppContent() {
  const { isCartOpen, closeCart } = useCart();
  const { isTechCartOpen, closeTechCart } = useTechCart();
  const { isHomeCartOpen, closeHomeCart } = useHomeLivingCart();
  const location = useLocation();
  const { settings, loading: settingsLoading } = useSettings();
  
  const isStudioPath = location.pathname.startsWith('/studio');

  // Global Maintenance Mode Guard
  const isMaintenanceMode = settings.system_status?.maintenance_mode;
  const brandName = settings.branding?.brand_name || 'RHAYSOURCE';

  useEffect(() => {
    // Sync Document Title
    document.title = brandName + (settings.branding?.tagline ? ` | ${settings.branding.tagline}` : '');
    
    closeCart();
    closeTechCart();
    closeHomeCart();
  }, [location.pathname, brandName, settings.branding?.tagline, closeCart, closeTechCart, closeHomeCart]);

  if (isMaintenanceMode && !isStudioPath) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a', color: '#fff', textAlign: 'center', padding: '2rem' }}>
        <div style={{ padding: '3rem', border: '1px solid #1a1a1a', borderRadius: '12px', background: '#000' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '2.5rem', marginBottom: '1.5rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            {brandName}
          </h1>
          <div style={{ height: '1px', width: '40px', background: '#FEBB00', margin: '0 auto 2rem' }} />
          <p style={{ fontSize: '1.1rem', color: '#888', maxWidth: '400px', lineHeight: '1.6' }}>
            {settings.branding?.tagline || 'The curation is undergoing administrative synchronization. Please return shortly for the next collection release.'}
          </p>
          <div style={{ marginTop: '3rem', fontSize: '0.75rem', letterSpacing: '0.1em', color: '#333' }}>
            OPERATIONAL STATUS: MAINTENANCE
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      {!isStudioPath && <Navbar />}
      <main className={isStudioPath ? 'studio-main' : ''}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/workspace/shop" element={<WorkspaceShopPage />} />
          <Route path="/workspace/about" element={<WorkspaceAboutPage />} />
          <Route path="/workspace/products/:id" element={<WorkspaceProductDetailPage />} />

          <Route path="/home-living" element={<HomeLivingPage />} />
          <Route path="/home-living/shop" element={<HomeLivingShopPage />} />
          <Route path="/home-living/products/:id" element={<HomeLivingProductDetailPage />} />

          {/* Studio Routes */}
          <Route path="/studio/login" element={<StudioLoginPage />} />
          <Route path="/studio" element={
            <ProtectedRoute>
              <StudioDashboard />
            </ProtectedRoute>
          } />
          <Route path="/studio/products" element={
            <ProtectedRoute>
              <StudioProductsPage />
            </ProtectedRoute>
          } />
          <Route path="/studio/stores" element={
            <ProtectedRoute>
              <StudioStoresPage />
            </ProtectedRoute>
          } />
          <Route path="/studio/categories" element={
            <ProtectedRoute>
              <StudioCategoriesPage />
            </ProtectedRoute>
          } />
          <Route path="/studio/settings" element={
            <ProtectedRoute>
              <StudioSettingsPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isStudioPath && <Footer />}
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      <WorkspaceCartDrawer />
      <HomeLivingCartDrawer />
      <NotificationToastContainer />
      <ScrollToTopButton />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <SettingsProvider>
          <CartProvider>
            <TechCartProvider>
              <HomeLivingCartProvider>
                <BrowserRouter>
                  <AppContent />
                </BrowserRouter>
              </HomeLivingCartProvider>
            </TechCartProvider>
          </CartProvider>
        </SettingsProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
