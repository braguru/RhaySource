import React from 'react';
import { FiSearch, FiUser, FiShoppingBag } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar-wrapper">
      <nav className="navbar glass container">
        <div className="navbar-brand">
          <h1>rhay<span>source</span></h1>
        </div>
        
        <ul className="navbar-links">
          <li><a href="#skincare">Skincare</a></li>
          <li><a href="#routine">Routine Planner</a></li>
          <li><a href="#concern">Shop By Concern</a></li>
          <li><a href="#about">About</a></li>
        </ul>

        <div className="navbar-actions">
          <button aria-label="Search" className="icon-btn"><FiSearch /></button>
          <button aria-label="Account" className="icon-btn"><FiUser /></button>
          <button aria-label="Cart" className="icon-btn cart-btn">
            <FiShoppingBag />
            <span>Bag (1)</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
