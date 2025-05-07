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
        {/* Nav Links + Auth (all left) */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="hover:underline">Home</Link>
          <a href="#about" className="hover:underline">About Us</a>
          <a href="#how-it-works" className="hover:underline">How It Works</a>
          <a href="#footer" className="hover:underline">Contact</a>
          {!user && (
            <Link to="/login" className="bg-[#8B7355] text-white px-4 py-2 rounded hover:bg-[#6B563D]">
              Login / Signup
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;