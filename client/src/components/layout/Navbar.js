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
    <nav className="bg-[#D3CABE] text-black py-4 shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
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
                  className="ml-2 rounded-full w-9 h-9 overflow-hidden border border-gray-300"
                >
                  <img src={getAvatarUrl()} alt="Profile" className="w-full h-full object-cover" />
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 transform origin-top-right transition-all duration-200 ease-out opacity-0 scale-95 translate-y-2 animate-in fade-in slide-in-from-top-2">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm font-serif text-[#8B7355] hover:bg-[#D3CABE] hover:text-[#6B563D] transition-colors duration-150"
                    >
                      Edit Profile
                    </Link>
                    <Link 
                      to="/purchases" 
                      className="block px-4 py-2 text-sm font-serif text-[#8B7355] hover:bg-[#D3CABE] hover:text-[#6B563D] transition-colors duration-150"
                    >
                      My Purchases
                    </Link>
                    <Link 
                      to="/my-listings" 
                      className="block px-4 py-2 text-sm font-serif text-[#8B7355] hover:bg-[#D3CABE] hover:text-[#6B563D] transition-colors duration-150"
                    >
                      My Listings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm font-serif text-[#8B7355] hover:bg-[#D3CABE] hover:text-[#6B563D] transition-colors duration-150"
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
