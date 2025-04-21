// src/components/layout/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiMenu, FiX, FiShoppingCart } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

const Navbar = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      if (error) throw error;
      setCartCount(data.length);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Get the appropriate avatar URL
  const getProfileAvatar = () => {
    if (!user) return null;
    
    // If user has a saved custom avatar URL, use it
    if (user.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    
    // Otherwise generate a default avatar based on email
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
  };

  return (
    <nav className="bg-[#D3CABE] text-black py-4 shadow-sm relative z-50">
      <div className="w-full flex justify-between items-center px-4 sm:px-6">
        {/* Logo */}
        <div className="text-lg font-serif font-semibold tracking-wide">
          <Link to="/">
            <img
              src="/Images/logo.png"
              alt="Logo"
              className="w-12 h-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/explore" className="hover:underline">Browse</Link>
          <div className="flex items-center gap-1 hover:underline cursor-pointer">
            <FiSearch />
            <span>Search</span>
          </div>
          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/cart" className="relative hover:text-[#8B7355]">
                <FiShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#8B7355] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/profile"
                className="text-gray-700 hover:text-[#8B7355] transition-colors"
              >
                <img
                  src={getProfileAvatar()}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-contain border-2 border-[#8B7355]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultAvatar;
                  }}
                />
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="hover:underline flex items-center gap-1">
              <FiUser />
              <span>Login / Signup</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 px-6 space-y-3 text-sm font-medium">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block hover:underline">Home</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="block hover:underline">About</Link>
          <Link to="/explore" onClick={() => setMenuOpen(false)} className="block hover:underline">Browse</Link>
          <div className="flex items-center gap-1 hover:underline cursor-pointer">
            <FiSearch />
            <span>Search</span>
          </div>
          {user ? (
            <div className="space-y-3">
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-[#8B7355]">
                <FiShoppingCart className="w-5 h-5" />
                <span>Cart ({cartCount})</span>
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-[#8B7355] transition-colors"
                >
                  <img
                    src={getProfileAvatar()}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-contain border-2 border-[#8B7355]"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultAvatar;
                    }}
                  />
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-1 hover:underline">
              <FiUser />
              <span>Login / Signup</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;