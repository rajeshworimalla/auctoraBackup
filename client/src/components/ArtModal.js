// ArtModal.js
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const ArtModal = ({ isOpen, onClose, art }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [bids, setBids] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

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
      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select('*')
        .eq('auction_id', auctionId)
        .single();
      if (auctionError) {
        console.error('[ArtModal] Error fetching auction:', auctionError);
        return;
      }
      // Check if auction has ended
      const now = new Date();
      const end = new Date(auctionData.end_time);
      if (now >= end && auctionData.status !== 'ended') {
        await supabase
          .from('auctions')
          .update({ status: 'ended' })
          .eq('auction_id', auctionId);
      }

      console.log('Fetching bids with query:', {
        auctionId,
        query: '*',
        order: 'amount.desc',
        limit: 3
      });

      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .select('*')
        .eq('auction_id', auctionId)
        .order('amount', { ascending: false })
        .limit(3);

      if (bidError) {
        console.error('Error fetching bids:', bidError);
        return;
      }

      console.log('Fetched bids:', bidData);

      // Fetch usernames from the User table with corrected query
      const enrichedBids = await Promise.all(
        bidData.map(async (bid) => {
          console.log('Fetching user for bid:', bid); // Debugging log
          try {
            const { data: userData, error: userError } = await supabase
              .from('User')
              .select('Username') // Only select Username field
              .eq('User_Id', bid.bidder_id)
              .single();

            console.log('Supabase query executed for bidder_id:', bid.bidder_id); // Debugging log
            if (userError) {
              console.error(`Error fetching user for bidder_id ${bid.bidder_id}:`, userError);
              return { ...bid, user: { display_name: 'Anonymous' } };
            }

            console.log('Fetched user data:', userData); // Debugging log
            const displayName = userData?.Username || 'Anonymous';
            console.log(`Using username for bidder_id ${bid.bidder_id}: ${displayName}`); // Debugging log
            return { ...bid, user: { display_name: displayName } };
          } catch (err) {
            console.error(`Error fetching user for bidder_id ${bid.bidder_id}:`, err);
            return { ...bid, user: { display_name: 'Anonymous' } };
          }
        })
      );

      console.log('Final enriched bids:', enrichedBids); // Debugging log
      setBids(enrichedBids || []);
    } catch (err) {
      console.error('[ArtModal] Error in fetchBids:', err);
    }
  };

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
  const handleBid = async (e) => {
    e.preventDefault();
    if (!user) {
      const confirmLogin = window.confirm('You need to be logged in to place a bid. Would you like to log in now?');
      if (confirmLogin) {
        onClose();
        navigate('/login');
      }
      return;
    }

    // Check if user is trying to bid on their own auction
    if (user.id === art.artwork?.owner_id) {
      alert('You cannot bid on your own auction.');
      return;
    }

    try {
      setLoading(true);
      const amount = parseFloat(bidAmount);
      
      // Add validation for negative values and zero
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Bid amount must be greater than zero');
      }
      
      if (amount <= highestBid) {
        throw new Error('Bid must be higher than the current highest bid');
      }

      const now = new Date();
      const end = new Date(art.end_time);
      if (now >= end) {
        alert('Bidding has ended for this artwork.');
        return;
      }

      // Get the auction ID and ensure it's a valid UUID
      const auctionId = art.auction_id;
      
      console.log('Debug - Bid Data:', {
        art: art,
        auctionId: auctionId,
        bidAmount: amount,
        userId: user.id
      });

      if (!auctionId) {
        throw new Error('No auction ID found');
      }

      // Place the bid
      const { data: bidData, error: bidError } = await supabase
        .from('bids')
        .insert([
          {
            auction_id: auctionId,
            amount: amount,
            bidder_id: user.id
          }
        ])
        .select();

      if (bidError) {
        console.error('Bid error:', bidError);
        throw bidError;
      }

      // Update auction's highest bid
      const { error: auctionError } = await supabase
        .from('auctions')
        .update({
          current_highest_bid: amount,
          highest_bidder_id: user.id,
          status: 'active'
        })
        .eq('auction_id', auctionId);

      if (auctionError) {
        console.error('Auction update error:', auctionError);
        throw auctionError;
      }

      // Update local state
      const newBid = {
        ...bidData[0],
        user: { raw_user_meta_data: user.user_metadata }
      };

      const updatedBids = [newBid, ...bids]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      setBids(updatedBids);
      setBidAmount('');
      alert('Bid placed successfully!');
      
      // Refresh auction data
      fetchBids();
    } catch (error) {
      console.error('Error placing bid:', error);
      alert(error.message || 'Failed to place bid. Please try again.');
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
            Current Price: <span className="font-semibold">${highestBid}</span>
          </p>
          <p className="text-sm text-gray-600">
            Minimum Bid: <span className="font-semibold">${highestBid + 1}</span>
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
                placeholder={`Minimum bid: $${highestBid + 1}`}
                className="flex-1 p-2 border rounded"
                min={highestBid + 1}
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
