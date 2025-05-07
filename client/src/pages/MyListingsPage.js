import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FiImage, FiClock, FiTag } from 'react-icons/fi';

const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Please log in to view your listings');

        // Fetch gallery listings
        const { data: gallery, error: galleryError } = await supabase
          .from('gallery')
          .select('*, Artwork(*)')
          .eq('Artwork.owner_id', user.id);

        if (galleryError) throw galleryError;

        // Fetch auction listings
        const { data: auctions, error: auctionError } = await supabase
          .from('auctions')
          .select('*, Artwork(*)')
          .eq('Artwork.owner_id', user.id);

        if (auctionError) throw auctionError;

        // Combine and normalize
        const galleryCards = (gallery || []).map(item => ({
          id: item.id,
          type: 'Gallery',
          title: item.Artwork?.title,
          artist: item.Artwork?.artist_name,
          image: item.Artwork?.image_url,
          price: item.Artwork?.price,
          status: item.Artwork?.is_sold ? 'Sold' : 'Active',
          created_at: item.Artwork?.created_at,
        }));

        const auctionCards = (auctions || []).map(item => ({
          id: item.id,
          type: 'Auction',
          title: item.Artwork?.title,
          artist: item.Artwork?.artist_name,
          image: item.Artwork?.image_url,
          price: item.starting_price,
          status: item.status,
          created_at: item.created_at,
        }));

        setListings([...galleryCards, ...auctionCards]);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355] mx-auto"></div>
          <p className="mt-4 text-[#8B7355] font-serif">Loading your listings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="text-red-600 font-serif">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-serif font-bold text-[#8B7355] mb-8">My Listings</h1>
        
        {listings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FiImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-serif text-gray-600 mb-2">No Listings Yet</h2>
            <p className="text-gray-500">You haven't listed any artworks or auctions yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="relative h-48">
                  <img 
                    src={item.image || '/Images/placeholder-art.jpg'} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.type === 'Gallery' 
                        ? 'bg-[#D3CABE] text-[#8B7355]' 
                        : 'bg-[#8B7355] text-white'
                    }`}>
                      {item.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.status === 'Active' || item.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-serif font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {item.artist}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-[#8B7355]">
                      <FiTag className="mr-1" />
                      <span className="text-lg font-bold">${item.price}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiClock className="mr-1" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListingsPage;