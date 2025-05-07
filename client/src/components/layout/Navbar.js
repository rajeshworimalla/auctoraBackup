// Updated Navbar layout with conditional rendering for logged-in users
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiBell } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

const Navbar = ({ user }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfileDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getAvatarUrl = () => {
    if (!user) return null;
    return user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Logo */}
          <div className="text-lg font-serif font-semibold tracking-wide">
            <Link to="/">
              <img
                src="/Images/logo.png"
                alt="Auctora Logo"
                className="w-20 h-auto object-contain"
              />
            </Link>
          </div>

          {/* Center: Nav Links (only when logged out) */}
          {!user && (
            <div className="absolute left-1/2 transform -translate-x-1/2 flex space-x-8 text-base font-medium">
              <Link to="/" className="hover:underline">Home</Link>
              <a href="#about" className="hover:underline">About Us</a>
              <a href="#how-it-works" className="hover:underline">How It Works</a>
              <a href="#footer" className="hover:underline">Contact</a>
            </div>
          )}

          {/* Right: Notification, Cart, Profile when logged in OR Login when logged out */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <Link to="/login" className="bg-[#8B7355] text-white px-4 py-2 rounded hover:bg-[#6B563D]">
                Login / Signup
              </Link>
            ) : (
              <>
                <Link to="/notifications" className="relative">
                  <FiBell size={22} />
                </Link>
                <Link to="/cart" className="relative">
                  <FiShoppingCart size={22} />
                </Link>
                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-3 focus:outline-none"
                  >
                    <img
                      src={user.user_metadata?.avatar_url || '/Images/default-avatar.png'}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="text-gray-700">{user.user_metadata?.full_name || 'User'}</span>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#F5F5F5] ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-base text-gray-900 hover:bg-[#E5E0D5] transition-colors duration-200"
                          role="menuitem"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          Edit Profile
                        </Link>
                        <Link
                          to="/purchases"
                          className="block px-4 py-2 text-base text-gray-900 hover:bg-[#E5E0D5] transition-colors duration-200"
                          role="menuitem"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          My Purchases
                        </Link>
                        <Link
                          to="/listings"
                          className="block px-4 py-2 text-base text-gray-900 hover:bg-[#E5E0D5] transition-colors duration-200"
                          role="menuitem"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          My Listings
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-base text-gray-900 hover:bg-[#E5E0D5] transition-colors duration-200"
                          role="menuitem"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
