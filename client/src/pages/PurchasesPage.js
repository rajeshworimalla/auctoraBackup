import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { FiPackage, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all orders for the user
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            artwork:artwork_id (
              artwork_id,
              title,
              image_url,
              artist_name,
              price
            )
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Separate active and past orders
      const now = new Date();
      const activeOrders = orders.filter(order => 
        order.status !== 'delivered' && 
        new Date(order.created_at) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      );
      
      const pastOrders = orders.filter(order => 
        order.status === 'delivered' || 
        new Date(order.created_at) <= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      );

      setOrders(orders);
      setActiveOrders(activeOrders);
      setPastOrders(pastOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleMarkAsDelivered = async (orderId) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'delivered',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      setSuccessMessage('Order marked as delivered successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      setError('Failed to mark order as delivered');
    }
  };

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
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-8">My Purchases</h1>

        {/* Active Orders */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Active Orders</h2>
          {activeOrders.length > 0 ? (
            <div className="space-y-6">
              {activeOrders.map(order => (
                <div key={order.order_id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Order #{order.order_id}</p>
                      <p className="text-sm text-gray-600">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  {order.order_items.map(item => (
                    <div key={item.order_item_id} className="flex items-center space-x-4 mb-4">
                      <img 
                        src={item.artwork?.image_url || '/Images/placeholder-art.jpg'} 
                        alt={item.artwork?.title} 
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium">{item.artwork?.title}</h3>
                        <p className="text-sm text-gray-600">by {item.artwork?.artist_name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: ${item.price_at_time}</p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4 mt-4">
                    <p className="text-right font-medium">Total: ${order.total_amount}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-600 mb-4">You have no active orders at the moment.</p>
              <Link to="/explore" className="text-[#8B7355] hover:text-[#6B563D] font-medium">
                Start Shopping
              </Link>
            </div>
          )}
        </div>

        {/* Past Purchases */}
        <div>
          <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">Past Purchases</h2>
          {pastOrders.length > 0 ? (
            <div className="space-y-6">
              {pastOrders.map(order => (
                <div key={order.order_id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Order #{order.order_id}</p>
                      <p className="text-sm text-gray-600">Delivered on {new Date(order.updated_at).toLocaleDateString()}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Delivered
                    </span>
                  </div>
                  {order.order_items.map(item => (
                    <div key={item.order_item_id} className="flex items-center space-x-4 mb-4">
                      <img 
                        src={item.artwork?.image_url || '/Images/placeholder-art.jpg'} 
                        alt={item.artwork?.title} 
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-medium">{item.artwork?.title}</h3>
                        <p className="text-sm text-gray-600">by {item.artwork?.artist_name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: ${item.price_at_time}</p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-4 mt-4">
                    <p className="text-right font-medium">Total: ${order.total_amount}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-600 mb-4">You haven't made any purchases yet.</p>
              <Link to="/explore" className="text-[#8B7355] hover:text-[#6B563D] font-medium">
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchasesPage;