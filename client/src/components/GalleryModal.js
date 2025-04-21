import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FiShoppingCart, FiHeart, FiShare2, FiInfo } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const GalleryModal = ({ isOpen, onClose, artwork }) => {
  const [user, setUser] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  const handleAddToCart = async () => {
    if (!user) {
      const confirmLogin = window.confirm('You need to be logged in to add items to cart. Would you like to log in now?');
      if (confirmLogin) {
        sessionStorage.setItem('pendingCartItem', JSON.stringify({
          artworkId: artwork.artwork_id,
          quantity: quantity
        }));
        onClose();
        navigate('/login');
      }
      return;
    }

    try {
      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('artwork_id', artwork.artwork_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
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
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-[90%] max-w-4xl rounded-lg relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl z-10"
        >
          ×
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Left Column - Image and Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src={artwork.image_url || '/Images/placeholder-art.jpg'}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Additional Images */}
            <div className="grid grid-cols-4 gap-2">
              {[artwork.image_url, ...Array(3)].map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {img && (
                    <img
                      src={img}
                      alt={`${artwork.title} view ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Details and Actions */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif mb-2">{artwork.title}</h2>
              <p className="text-gray-600 mb-4">by {artwork.artist_name || 'Unknown Artist'}</p>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-2xl font-medium text-[#8B7355]">
                  ${artwork.price || 'Price on request'}
                </span>
                {artwork.original_price && (
                  <span className="text-lg text-gray-400 line-through">
                    ${artwork.original_price}
                  </span>
                )}
              </div>
            </div>

            {/* Artwork Details */}
            <div className="space-y-3 text-sm">
              <p><span className="font-medium">Medium:</span> {artwork.medium || 'Not specified'}</p>
              <p><span className="font-medium">Dimensions:</span> {artwork.dimensions || 'Not specified'}</p>
              <p><span className="font-medium">Year:</span> {artwork.year || 'Unknown'}</p>
              <p><span className="font-medium">Category:</span> {artwork.category || 'Mixed Media'}</p>
              <p><span className="font-medium">Style:</span> {artwork.style || 'Contemporary'}</p>
            </div>

            <div className="space-y-3">
              <p className="text-gray-700">{artwork.description}</p>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2">
                <button
                  className="flex-1 bg-[#8B7355] text-white py-3 px-6 rounded-lg hover:bg-[#6B563D] transition-all duration-200"
                  onClick={() => {/* Add to Cart logic */}}
                >
                  Add to Cart
                </button>
                <button
                  className="flex-1 border border-[#8B7355] text-[#8B7355] py-3 px-6 rounded-lg hover:bg-[#8B7355] hover:text-white transition-all duration-200"
                  onClick={() => {/* Buy Now logic */}}
                >
                  Buy Now
                </button>
              </div>
              <button
                className="w-full border border-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-50 transition-all duration-200"
                onClick={() => {/* Add to Wishlist logic */}}
              >
                Add to Wishlist
              </button>
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