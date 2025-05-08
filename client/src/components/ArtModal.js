// ArtModal.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ArtModal = ({ isOpen, onClose, art, onBidUpdate }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [bids, setBids] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentBid, setCurrentBid] = useState(art?.current_highest_bid || art?.starting_price || 0);
  const [bidCount, setBidCount] = useState(0);

  // Check authentication status
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  // ⏳ Countdown Logic
  useEffect(() => {
    if (!art?.end_time) return;
  
    const calculateTimeLeft = () => {
      const end = new Date(art.end_time).getTime();
      const now = new Date().getTime();
      const distance = end - now;
  
      if (distance <= 0) {
        setTimeLeft({ expired: true });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((distance / (1000 * 60)) % 60),
          seconds: Math.floor((distance / 1000) % 60),
          expired: false,
        });
      }
    };
  
    // ⏱ Run once immediately
    calculateTimeLeft();
  
    // 🔁 Then run every second
    const interval = setInterval(calculateTimeLeft, 1000);
  
    return () => clearInterval(interval);
  }, [art?.end_time]);
  
  // Debug: Log modal open/close and art prop
  useEffect(() => {
    console.log('[ArtModal] isOpen:', isOpen, 'art:', art);
  }, [isOpen, art]);

  // Fetch bids for this artwork/auction
  const fetchBids = async () => {
    try {
      const auctionId = art?.auction_id || art?.id;
      console.log('[ArtModal] fetchBids called. auctionId:', auctionId);
      if (!auctionId) {
        console.error('[ArtModal] No auction ID found', art);
        return;
      }

      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .select(`
          *,
          User:bidder_id (
            Username
          )
        `)
        .eq('auction_id', auctionId)
        .order('amount', { ascending: false })
        .limit(3);

      if (bidError) {
        console.error('Error fetching bids:', bidError);
        return;
      }

      console.log('Fetched bids:', bidData);

      // Transform bids to include username
      const enrichedBids = bidData.map(bid => ({
        ...bid,
        user: {
          display_name: bid.User?.Username || 'Anonymous'
        }
      }));

      console.log('Final enriched bids:', enrichedBids);
      setBids(enrichedBids || []);
    } catch (err) {
      console.error('[ArtModal] Error in fetchBids:', err);
    }
  };

  // Subscribe to real-time bid updates
  useEffect(() => {
    if (!isOpen || !art?.auction_id) return;

    // Initial fetch of bid count
    const fetchBidCount = async () => {
      const { count } = await supabase
        .from('bids')
        .select('*', { count: 'exact', head: true })
        .eq('auction_id', art.auction_id);
      setBidCount(count || 0);
    };
    fetchBidCount();

    // Subscribe to new bids
    const subscription = supabase
      .channel('bids_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${art.auction_id}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Update bid count
            setBidCount(prev => prev + 1);
            // Update current bid if the new bid is higher
            if (payload.new.amount > currentBid) {
              setCurrentBid(payload.new.amount);
            }
            // Fetch updated bids list
            fetchBids();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen, art?.auction_id]);

  // Remove duplicate fetchBids definition and use the global one in useEffect
  useEffect(() => {
    if (isOpen && (art?.auction_id || art?.id)) {
      fetchBids();
    }
  }, [isOpen, art?.auction_id, art?.id]);

  // Determine the highest bid from bids array or current_highest_bid
  const topBids = bids || [];
  const highestBid = topBids.length > 0
    ? Math.max(...topBids.map(b => b.amount))
    : (
        (art && typeof art.current_highest_bid === 'number' ? art.current_highest_bid : 0) ||
        (art && typeof art.starting_price === 'number' ? art.starting_price : 0)
      );

  // Get highest bidder's username
  const highestBidder = topBids.length > 0 ? topBids[0]?.user?.display_name : null;

  // Handle bid button click
  const handleBidClick = () => {
    if (!user) {
      const confirmLogin = window.confirm('You need to be logged in to place a bid. Would you like to log in now?');
      if (confirmLogin) {
        // Store the current artwork details in sessionStorage
        sessionStorage.setItem('pendingBid', JSON.stringify({
          auctionId: art.id,
          amount: bidAmount
        }));
        onClose(); // Close the modal
        navigate('/login'); // Redirect to login page
      }
      return;
    }

    // If user is logged in, proceed with bid
    handleBid();
  };

  // Submit bid logic
  const handleBid = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to place a bid');
        return;
      }

      if (bidAmount <= 0) {
        toast.error('Please enter a valid bid amount');
        return;
      }

      if (bidAmount <= currentBid) {
        toast.error('Your bid must be higher than the current highest bid');
        return;
      }

      if (user.id === art.owner_id) {
        toast.error('You cannot bid on your own auction');
        return;
      }

      setLoading(true);

      // Insert the bid
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .insert([
          {
            auction_id: art.auction_id,
            bidder_id: user.id,
            amount: bidAmount,
            bid_time: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (bidError) throw bidError;

      // Update the auction's highest bid
      const { error: updateError } = await supabase
        .from('auctions')
        .update({ current_highest_bid: bidAmount })
        .eq('auction_id', art.auction_id);

      if (updateError) throw updateError;

      // Get the user's username
      const { data: userData } = await supabase
        .from('User')
        .select('Username')
        .eq('id', user.id)
        .single();

      // Create a new bid object with the username
      const newBid = {
        ...bidData,
        user: {
          display_name: userData?.Username || 'Anonymous'
        }
      };

      // Update local state immediately
      setBids(prevBids => [newBid, ...prevBids]);
      setCurrentBid(bidAmount);
      setBidCount(prev => prev + 1);
      setBidAmount('');
      toast.success('Bid placed successfully!');
      
      // Update the parent component
      onBidUpdate(art.auction_id, bidAmount);
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Failed to place bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset bids when modal closes
  useEffect(() => {
    if (!isOpen) {
      console.log('[ArtModal] Modal closed, resetting bids');
      setBids([]);
    }
  }, [isOpen]);

  // Handler to move unsold ended auction artwork to gallery
  const handleMoveToGallery = async () => {
    try {
      // Check if already in gallery
      const { data: existing, error: checkError } = await supabase
        .from('gallery')
        .select('artwork_id')
        .eq('artwork_id', art.artwork?.artwork_id || art.artwork_id)
        .single();

      if (existing) {
        alert('This artwork is already in the gallery.');
        return;
      }

      // Insert into gallery
      const { error: insertError } = await supabase
        .from('gallery')
        .insert([{ artwork_id: art.artwork?.artwork_id || art.artwork_id, featured: false, display_order: 1 }]);

      if (insertError) {
        alert('Failed to move artwork to gallery.');
      } else {
        alert('Artwork moved to gallery!');
      }
    } catch (err) {
      alert('Error moving artwork to gallery.');
    }
  };

  if (!isOpen || !art) return null;

  // Get the artwork image URL from either the auction or artwork object
  const imageUrl = art.artwork?.image_url || art.image_url || '/Images/placeholder-art.jpg';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-lg rounded-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-2xl font-serif mb-4">{art.artwork?.title || art.title}</h2>

        {/* Image */}
        <div className="mb-4">
          <img
            src={imageUrl}
            alt={art.artwork?.title || art.title}
            className="w-full h-64 object-contain bg-gray-100 rounded"
          />
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4">{art.artwork?.description || art.description}</p>

        {/* Current Price and Minimum Bid */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Current Price: <span className="font-semibold">${currentBid}</span>
            {bids.length > 0 && (
              <span className="text-sm text-gray-500 ml-2">
                ({bidCount} {bidCount === 1 ? 'bid' : 'bids'} placed)
              </span>
            )}
          </p>
          <p className="text-sm text-gray-600">
            Minimum Bid: <span className="font-semibold">${currentBid + 1}</span>
          </p>
        </div>

        {/* Countdown */}
        {timeLeft?.expired ? (
          <div className="mb-2">
            <p className="text-red-500">Auction ended</p>
            {/* Show button if not sold */}
            {!art.artwork?.is_sold && (
              <button
                onClick={handleMoveToGallery}
                className="mt-2 px-4 py-2 bg-[#8B7355] text-white rounded hover:bg-[#6B563D] transition"
              >
                Move to Gallery
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm mb-2 text-gray-800">
            Time Left: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </p>
        )}

        {/* Bid Input */}
        {timeLeft?.expired ? (
          <p className="text-red-500 mb-2">Auction ended</p>
        ) : user && user.id === art.artwork?.owner_id ? (
          <div className="text-[#8B7355] font-serif text-center py-4">
            This is your own auction
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow positive numbers
                  if (value === '' || (parseFloat(value) > 0)) {
                    setBidAmount(value);
                  }
                }}
                placeholder={`Minimum bid: $${currentBid + 1}`}
                className="flex-1 p-2 border rounded"
                min={currentBid + 1}
                step="0.01"
              />
              <button
                onClick={handleBid}
                disabled={loading}
                className="bg-[#8B7355] text-white px-4 py-2 rounded hover:bg-[#6B563D] transition-colors duration-200"
              >
                {loading ? 'Placing Bid...' : 'Place Bid'}
              </button>
            </div>
          </div>
        )}

        {/* Live Bids */}
        <div>
          <h4 className="text-sm font-semibold mb-1">Live Bids:</h4>
          {bids.length === 0 ? (
            <p className="text-xs text-gray-500">No bids yet</p>
          ) : (
            <ul className="text-sm space-y-1 max-h-32 overflow-y-auto text-yellow-900 font-semibold">
              {bids.map((b, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>
                    ${b.amount} by {b.user?.display_name || 'Anonymous'}
                  </span>
                  {i === 0 && <span className="text-yellow-500 font-bold ml-2">★ Highest</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtModal;
