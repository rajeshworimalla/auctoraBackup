// Updated Navbar layout with conditional rendering for logged-in users
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiBell } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';

const Navbar = ({ user }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
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

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('notifications')
          .select('count')
          .eq('user_id', user.id)
          .eq('read', false)
          .single();
        
        if (!error && data) {
          setNotificationCount(data.count);
        }
      }
    };

    fetchNotificationCount();
  }, [user]);

  // Fetch cart item count
  useEffect(() => {
    const fetchCartCount = async () => {
      if (user) {
        const { count, error } = await supabase
          .from('cart_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        if (!error) setCartItemCount(count);
      }
    };

    fetchCartCount();

    // Listen for custom event
    const handler = () => fetchCartCount();
    window.addEventListener('cart-updated', handler);

    return () => window.removeEventListener('cart-updated', handler);
  }, [user]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfileDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    navigate('/');
    setTimeout(() => {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handlePurposeClick = (e) => {
    e.preventDefault();
    navigate('/');
    setTimeout(() => {
      const purposeSection = document.getElementById('purpose');
      if (purposeSection) {
        purposeSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleHowItWorksClick = (e) => {
    e.preventDefault();
    navigate('/');
    setTimeout(() => {
      const howItWorksSection = document.getElementById('how-it-works');
      if (howItWorksSection) {
        howItWorksSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleWhoWeAreClick = (e) => {
    e.preventDefault();
    navigate('/');
    setTimeout(() => {
      const whoWeAreSection = document.getElementById('who-we-are');
      if (whoWeAreSection) {
        whoWeAreSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    navigate('/');
    setTimeout(() => {
      const footerSection = document.getElementById('footer');
      if (footerSection) {
        footerSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
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
            <a href="#" onClick={handleAboutClick} className="hover:underline">About Us</a>
            <a href="#" onClick={handlePurposeClick} className="hover:underline">Our Purpose</a>
            <a href="#" onClick={handleHowItWorksClick} className="hover:underline">How It Works</a>
            <a href="#" onClick={handleWhoWeAreClick} className="hover:underline">Who We Are</a>
            <a href="#" onClick={handleContactClick} className="hover:underline">Contact Us</a>
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
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative">
                <FiShoppingCart size={22} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#8B7355] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              {/* Profile Dropdown */}
              <div 
                className="relative" 
                ref={dropdownRef}
              >
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="ml-2 rounded-full w-9 h-9 overflow-hidden border border-gray-300"
                >
                  <img src={getAvatarUrl()} alt="Profile" className="w-full h-full object-cover" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 transform origin-top-right transition-all duration-200 ease-out">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-lg font-serif text-black hover:bg-[#8B7355] hover:text-white transition-colors duration-150"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Edit Profile
                    </Link>
                    <Link
                      to="/purchases"
                      className="block px-4 py-2 text-lg font-serif text-black hover:bg-[#8B7355] hover:text-white transition-colors duration-150"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      My Purchases
                    </Link>
                    <Link
                      to="/my-listings" 
                      className="block px-4 py-2 text-lg font-serif text-black hover:bg-[#8B7355] hover:text-white transition-colors duration-150"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      My Listings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-lg font-serif text-black hover:bg-[#8B7355] hover:text-white transition-colors duration-150"
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
