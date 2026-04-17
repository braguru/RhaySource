import React from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/features/HeroSection';
import ProductCard from './components/features/ProductCard';
import ContactForm from './components/features/ContactForm';
import productsData from './data/products.json';
import './App.css';

function App() {
  const { products } = productsData;

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        
        <section className="container py-xl" id="skincare">
          <div className="section-header">
            <h2>The Daily Essentials</h2>
            <p>Curated formulas engineered to support your skin barrier.</p>
          </div>
          
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <ContactForm />
      </main>
      <Footer />
    </>
  );
}

export default App;
