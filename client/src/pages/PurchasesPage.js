import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      // Fetch gallery purchases
      const { data: gallery, error: galleryError } = await supabase
        .from('gallery_purchases')
        .select('*, Artwork(*)')
        .eq('buyer_id', supabase.auth.user()?.id);

      // Fetch auction wins
      const { data: auctions, error: auctionError } = await supabase
        .from('auction_wins')
        .select('*, auctions(*, Artwork(*))')
        .eq('winner_id', supabase.auth.user()?.id);

      // Combine and normalize
      const galleryCards = (gallery || []).map(item => ({
        id: item.id,
        type: 'Gallery',
        title: item.Artwork?.title,
        artist: item.Artwork?.artist_name,
        image: item.Artwork?.image_url,
        price: item.Artwork?.price,
        date: item.purchased_at,
      }));
      const auctionCards = (auctions || []).map(item => ({
        id: item.id,
        type: 'Auction',
        title: item.auctions?.Artwork?.title,
        artist: item.auctions?.Artwork?.artist_name,
        image: item.auctions?.Artwork?.image_url,
        price: item.final_price,
        date: item.won_at,
      }));
      setPurchases([...galleryCards, ...auctionCards]);
      setLoading(false);
    };
    fetchPurchases();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Purchases</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purchases.map((item) => (
          <div key={item.id} className="bg-white rounded shadow p-4">
            <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded mb-3" />
            <div className="font-semibold">{item.title}</div>
            <div className="text-sm text-gray-500">{item.artist}</div>
            <div className="text-sm">{item.type}</div>
            <div className="text-lg font-bold mt-2">${item.price}</div>
            <div className="text-xs text-gray-400 mt-1">{item.date && new Date(item.date).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PurchasesPage;