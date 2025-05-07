// Updated Navbar layout with conditional rendering for logged-in users
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiBell } from 'react-icons/fi';

const Navbar = ({ user }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getAvatarUrl = () => {
    if (!user) return null;
    return user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
  };

  return (
    <nav className="bg-[#D3CABE] text-black py-4 shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Left: Notification, Cart, Profile when logged in OR Login when logged out */}
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
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="ml-2 rounded-full w-9 h-9 overflow-hidden border border-gray-300"
                >
                  <img src={getAvatarUrl()} alt="Profile" className="w-full h-full object-cover" />
                </button>
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit Profile</Link>
                    <Link to="/purchases" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Purchases</Link>
                    <Link to="/my-listings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Listings</Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        window.location.href = '/logout';
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
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

        {/* Right: Logo */}
        <div className="text-lg font-serif font-semibold tracking-wide">
          <Link to="/">
            <img
              src="/Images/logo.png"
              alt="Auctora Logo"
              className="w-20 h-auto object-contain"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;