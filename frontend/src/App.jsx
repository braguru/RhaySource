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
import './App.css';

function AppContent() {
  const { isCartOpen, closeCart } = useCart();
  const { isTechCartOpen, closeTechCart } = useTechCart();
  const { isHomeCartOpen, closeHomeCart } = useHomeLivingCart();
  const location = useLocation();

  useEffect(() => {
    closeCart();
    closeTechCart();
    closeHomeCart();
  }, [location.pathname, closeCart, closeTechCart, closeHomeCart]);

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
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

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      <WorkspaceCartDrawer />
      <HomeLivingCartDrawer />
      <ScrollToTopButton />
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <TechCartProvider>
        <HomeLivingCartProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </HomeLivingCartProvider>
      </TechCartProvider>
    </CartProvider>
  );
}

export default App;
