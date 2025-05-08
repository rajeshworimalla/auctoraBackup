import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FiPackage, FiClock } from 'react-icons/fi';

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Please log in to view your purchases');

        // Fetch gallery purchases
        const { data: gallery, error: galleryError } = await supabase
          .from('gallery_purchases')
          .select('*, Artwork(*)')
          .eq('buyer_id', user.id);

        if (galleryError) throw galleryError;

        // Fetch auction wins
        const { data: auctions, error: auctionError } = await supabase
          .from('auction_wins')
          .select('*, auctions(*, Artwork(*))')
          .eq('winner_id', user.id);

        if (auctionError) throw auctionError;

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
      } catch (error) {
        console.error('Error fetching purchases:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Please log in to view your purchases');
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*, artwork:artwork_id(title, image_url, price))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const activeOrders = orders.filter(order => order.status !== 'delivered');
  const pastPurchases = orders.filter(order => order.status === 'delivered');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355] mx-auto"></div>
          <p className="mt-4 text-[#8B7355] font-serif">Loading your purchases...</p>
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
        <h1 className="text-3xl font-serif font-bold text-[#8B7355] mb-8">My Purchases</h1>
        
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
          {/* Render activeOrders here */}
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">Past Purchases</h2>
          {/* Render pastPurchases here */}
        </section>
        
        {purchases.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-serif text-gray-600 mb-2">No Purchases Yet</h2>
            <p className="text-gray-500">You haven't purchased any artworks or won any auctions yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="relative h-48">
                  <img 
                    src={item.image || '/Images/placeholder-art.jpg'} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.type === 'Gallery' 
                        ? 'bg-[#D3CABE] text-[#8B7355]' 
                        : 'bg-[#8B7355] text-white'
                    }`}>
                      {item.type}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-serif font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {item.artist}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[#8B7355]">${item.price}</span>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiClock className="mr-1" />
                      {new Date(item.date).toLocaleDateString()}
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

export default PurchasesPage;