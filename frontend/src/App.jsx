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
import CartDrawer from './components/features/CartDrawer';
import WorkspaceCartDrawer from './components/features/WorkspaceCartDrawer';
import WorkspacePage from './pages/WorkspacePage';
import WorkspaceShopPage from './pages/WorkspaceShopPage';
import WorkspaceAboutPage from './pages/WorkspaceAboutPage';
import './App.css';

function AppContent() {
  const { isCartOpen, closeCart } = useCart();
  const { isTechCartOpen, closeTechCart } = useTechCart();
  const location = useLocation();

  // Close drawers automatically when the route changes
  useEffect(() => {
    closeCart();
    closeTechCart();
  }, [location.pathname, closeCart, closeTechCart]);
  
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/workspace/shop" element={<WorkspaceShopPage />} />
          <Route path="/workspace/about" element={<WorkspaceAboutPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      <WorkspaceCartDrawer />
      <ScrollToTopButton />
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <TechCartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TechCartProvider>
    </CartProvider>
  );
}

export default App;
