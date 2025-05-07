import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FiShoppingCart, FiHeart, FiShare2, FiInfo, FiMinus, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const GalleryModal = ({ isOpen, onClose, artwork }) => {
  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      const confirmLogin = window.confirm('You need to be logged in to add items to cart. Would you like to log in now?');
      if (confirmLogin) {
        onClose();
        navigate('/login');
      }
      return;
    }

    // Check if user is trying to buy their own artwork
    if (user.id === artwork.owner_id) {
      alert('You cannot purchase your own artwork.');
      return;
    }

    try {
      setLoading(true);
      
      // Check if item is already in cart
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('artwork_id', artwork.artwork_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw checkError;
      }

      if (existingItem) {
        // Update quantity if item exists
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Insert new item if it doesn't exist
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([
            {
              user_id: user.id,
              artwork_id: artwork.artwork_id,
              quantity: quantity,
              price: artwork.price
            }
          ]);

        if (insertError) throw insertError;
      }

      alert('Added to cart successfully!');
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const toggleWishlist = async () => {
    if (!user) {
      const confirmLogin = window.confirm('You need to be logged in to add items to wishlist. Would you like to log in now?');
      if (confirmLogin) {
        onClose();
        navigate('/login');
      }
      return;
    }

    try {
      if (isWishlisted) {
        const { error } = await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('artwork_id', artwork.artwork_id);

        if (error) throw error;
        setIsWishlisted(false);
      } else {
        const { error } = await supabase
          .from('wishlist')
          .insert([
            {
              user_id: user.id,
              artwork_id: artwork.artwork_id
            }
          ]);

        if (error) throw error;
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Failed to update wishlist. Please try again.');
    }
  };

  if (!isOpen || !artwork) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-4xl rounded-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <img
              src={artwork.image_url || '/Images/placeholder-art.jpg'}
              alt={artwork.title}
              className="w-full h-[400px] object-contain bg-gray-50 rounded-lg"
            />
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900">{artwork.title}</h2>
              <p className="text-gray-600 mt-1">by {artwork.artist_name}</p>
            </div>

            <p className="text-gray-700">{artwork.description}</p>

            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">${artwork.price}</p>
              <p className="text-sm text-gray-500">Category: {artwork.category}</p>
              <p className="text-sm text-gray-500">Medium: {artwork.medium}</p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Quantity:</span>
              <div className="flex items-center border rounded">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              {user && user.id === artwork.owner_id ? (
                <div className="text-[#8B7355] font-serif">
                  This is your own artwork
                </div>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={loading}
                    className="flex-1 bg-[#8B7355] text-white px-6 py-3 rounded-lg hover:bg-[#6B563D] transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <FiShoppingCart />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={loading}
                    className="flex-1 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                  >
                    Buy Now
                  </button>
                </>
              )}
            </div>

            {/* Shipping and Returns Info */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Free Shipping</h3>
                  <p className="text-sm text-gray-600">Estimated delivery: 5-7 business days</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Returns</h3>
                  <p className="text-sm text-gray-600">14-day return policy for full refund</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryModal; 