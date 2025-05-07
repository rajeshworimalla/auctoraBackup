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
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
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
    if (!profileDropdownOpen && !notifDropdownOpen) return;
    const handleClick = (e) => {
      if (!e.target.closest('.profile-dropdown')) setProfileDropdownOpen(false);
      if (!e.target.closest('.notif-dropdown')) setNotifDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileDropdownOpen, notifDropdownOpen]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (!user || !notifDropdownOpen) return;
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error) setNotifications(data);
    };
    fetchNotifications();
  }, [user, notifDropdownOpen]);

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
      <div className="w-full flex items-center px-4 sm:px-6">
        {/* Logo */}
        <div className="text-lg font-serif font-semibold tracking-wide mr-6">
          <Link to="/">
            <img
              src="/Images/logo.png"
              alt="Logo"
              className="w-12 h-auto object-contain"
            />
          </Link>
        </div>
        {/* Nav Links */}
        <div className="flex-1 flex items-center space-x-8">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/about" className="hover:underline">About Us</Link>
          <Link to="/how-it-works" className="hover:underline">How It Works</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
        </div>
        {/* Right Side */}
        <div className="flex items-center gap-4 ml-auto">
          {!user ? (
            <Link to="/login" className="bg-[#8B7355] text-white px-4 py-2 rounded hover:bg-[#6B563D]">
              Login / Signup
            </Link>
          ) : (
            <>
              {/* Cart, Notifications, Profile Dropdown (as previously implemented) */}
              <Link to="/cart" className="relative hover:text-[#8B7355]">
                <FiShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#8B7355] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <div className="relative notif-dropdown">
                <button
                  onClick={() => setNotifDropdownOpen((open) => !open)}
                  className="relative focus:outline-none"
                >
                  <FiBell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white border border-gray-200 rounded shadow-lg z-50 overflow-y-auto">
                    <div className="p-4 font-bold border-b">Notifications</div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-gray-500 text-center">No notifications yet.</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer ${notif.read ? 'text-gray-500' : 'font-semibold bg-gray-100'}`}
                        >
                          {notif.message}
                          <div className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
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
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;