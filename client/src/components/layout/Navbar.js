// src/components/layout/Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiUser, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#D3CABE] text-black py-4 shadow-sm relative z-50">
      <div className="w-full flex justify-between items-center px-4 sm:px-6">
        {/* Logo */}
        <div className="text-lg font-serif font-semibold tracking-wide">
          <Link to="/">Auctora</Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/Browse" className="hover:underline">Browse</Link>
          <div className="flex items-center gap-1 hover:underline cursor-pointer">
            <FiSearch />
            <span>Search</span>
          </div>
          <Link to="/auth" className="hover:underline flex items-center gap-1">
            <FiUser />
            <span>Login / Signup</span>
          </Link>
        </div>

        {/* Hamburger Icon (Mobile Only) */}
        <button
          className="md:hidden text-xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 px-6 space-y-3 text-sm font-medium">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block hover:underline">Home</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="block hover:underline">About</Link>
          <Link to="/Browse" onClick={() => setMenuOpen(false)} className="block hover:underline">Browse</Link>
          <div className="flex items-center gap-1 hover:underline cursor-pointer">
            <FiSearch />
            <span>Search</span>
          </div>
          <Link to="/auth" onClick={() => setMenuOpen(false)} className="flex items-center gap-1 hover:underline">
            <FiUser />
            <span>Login / Signup</span>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;