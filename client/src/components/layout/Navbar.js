// src/components/layout/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiMenu, FiX, FiShoppingCart, FiBell } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

const Navbar = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchCartCount();
      fetchUnreadNotifications();
    } else {
      setCartCount(0);
      setUnreadCount(0);
    }
  }, [user]);

  // Real-time cart count subscription
  useEffect(() => {
    if (!user) return;
    // Subscribe to cart_items changes for this user
    const subscription = supabase
      .channel('cart_items_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${user.id}` },
        () => fetchCartCount()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileDropdownOpen) return;
    const handleClick = (e) => {
      if (!e.target.closest('.profile-dropdown')) setProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileDropdownOpen]);

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

  const fetchUnreadNotifications = async () => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
        <div className="hidden md:flex items-center space-x-8 w-full">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/about" className="hover:underline">About</Link>
          <div className="flex items-center gap-4 ml-auto">
            {user ? (
              <>
                <Link to="/cart" className="relative hover:text-[#8B7355]">
                  <FiShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#8B7355] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/notifications" className="relative hover:text-[#8B7355]">
                  <FiBell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setProfileDropdownOpen((open) => !open)}
                    className="focus:outline-none"
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
                  </button>
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Edit Profile
                      </Link>
                      <Link
                        to="/purchases"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        My Purchases
                      </Link>
                      <Link
                        to="/my-listings"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        My Listings
                      </Link>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="hover:underline flex items-center gap-1">
                <FiUser />
                <span>Login / Signup</span>
              </Link>
            )}
          </div>
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
          {user ? (
            <div className="space-y-3">
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-[#8B7355] relative">
                <FiShoppingCart className="w-5 h-5" />
                <span>Cart{cartCount > 0 ? ` (${cartCount})` : ''}</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#8B7355] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link to="/notifications" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-[#8B7355] relative">
                <FiBell className="w-5 h-5" />
                <span>Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <div className="flex items-center space-x-4 profile-dropdown">
                <button
                  onClick={() => setProfileDropdownOpen((open) => !open)}
                  className="focus:outline-none"
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
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      Edit Profile
                    </Link>
                    <Link
                      to="/purchases"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      My Purchases
                    </Link>
                    <Link
                      to="/my-listings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      My Listings
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
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