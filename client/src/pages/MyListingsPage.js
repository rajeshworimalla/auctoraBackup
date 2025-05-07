import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      // Fetch gallery listings
      const { data: gallery, error: galleryError } = await supabase
        .from('gallery')
        .select('*, Artwork(*)')
        .eq('Artwork.owner_id', supabase.auth.user()?.id);

      // Fetch auction listings
      const { data: auctions, error: auctionError } = await supabase
        .from('auctions')
        .select('*, Artwork(*)')
        .eq('Artwork.owner_id', supabase.auth.user()?.id);

      // Combine and normalize
      const galleryCards = (gallery || []).map(item => ({
        id: item.id,
        type: 'Gallery',
        title: item.Artwork?.title,
        artist: item.Artwork?.artist_name,
        image: item.Artwork?.image_url,
        price: item.Artwork?.price,
        status: item.Artwork?.is_sold ? 'Sold' : 'Active',
      }));
      const auctionCards = (auctions || []).map(item => ({
        id: item.id,
        type: 'Auction',
        title: item.Artwork?.title,
        artist: item.Artwork?.artist_name,
        image: item.Artwork?.image_url,
        price: item.starting_price,
        status: item.status,
      }));
      setListings([...galleryCards, ...auctionCards]);
      setLoading(false);
    };
    fetchListings();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading your listings...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Listings</h1>
      {listings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          You have not listed any artworks or auctions yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div key={item.id} className="bg-white rounded shadow p-4">
              <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded mb-3" />
              <div className="font-semibold">{item.title}</div>
              <div className="text-sm text-gray-500">{item.artist}</div>
              <div className="text-sm">{item.type}</div>
              <div className="text-lg font-bold mt-2">${item.price}</div>
              <div className="text-xs text-gray-400 mt-1">{item.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListingsPage;