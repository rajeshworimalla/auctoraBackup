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
  
  // 📥 Fetch Bids for This Artwork
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const { data: auctionData, error: auctionError } = await supabase
          .from('auctions')
          .select('*')
          .eq('id', art.id)
          .single();

        if (auctionError) {
          console.error('Error fetching auction:', auctionError);
          return;
        }

        // Check if auction has ended
        const now = new Date();
        const end = new Date(auctionData.end_time);
        if (now >= end && auctionData.status !== 'ended') {
          // Update auction status to ended
          await supabase
            .from('auctions')
            .update({ status: 'ended' })
            .eq('id', art.id);
        }

        const { data: bidData, error: bidError } = await supabase
          .from('trendingbids')
          .select(`
            *,
            user:bidder_id (
              id,
              email
            )
          `)
          .eq('auction_id', art.auction_id || art.id)
          .order('amount', { ascending: false })
          .limit(3);

        if (bidError) {
          console.error('Error fetching bids:', bidError);
          return;
        }

        setBids(bidData || []);
      } catch (err) {
        console.error('Error in fetchBids:', err);
      }
    };

    fetchBids();
  }, [art?.id, isOpen]);

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
    const bidAmountNum = parseFloat(bidAmount);
    const currentHighestBid = art.current_highest_bid || art.starting_price || 0;

    // Validate bid amount
    if (isNaN(bidAmountNum) || bidAmountNum <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    // Check if bid is higher than current highest bid
    if (bidAmountNum <= currentHighestBid) {
      alert(`Your bid must be higher than the current highest bid: $${currentHighestBid}`);
      return;
    }

    const now = new Date();
    const end = new Date(art.end_time);
    if (now >= end) {
      alert('Bidding has ended for this artwork.');
      return;
    }

    try {
      // Get the auction ID and ensure it's a valid UUID
      const auctionId = art.auction_id;
      
      console.log('Debug - Bid Data:', {
        art: art,
        auctionId: auctionId,
        bidAmount: bidAmountNum,
        userId: user.id
      });

      if (!auctionId) {
        throw new Error('No auction ID found');
      }

      // Place the bid
      const { data: bidData, error: bidError } = await supabase
        .from('trendingbids')
        .insert([
          {
            auction_id: auctionId,
            amount: bidAmountNum,
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
          current_highest_bid: bidAmountNum,
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
        user: { email: user.email }
      };

      const updatedBids = [newBid, ...bids]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      setBids(updatedBids);
      setBidAmount('');
      alert('Bid placed successfully!');
      
      // Refresh auction data
      fetchBids();
    } catch (err) {
      console.error('Bid placement error:', err);
      alert(err.message || 'Failed to place bid. Please try again.');
    }
  };

  // Update fetchBids function
  const fetchBids = async () => {
    try {
      const auctionId = art.auction_id;
      
      if (!auctionId) {
        console.error('No auction ID found');
        return;
      }

      console.log('Fetching bids for auction:', auctionId);

      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select('*')
        .eq('auction_id', auctionId)
        .single();

      if (auctionError) {
        console.error('Error fetching auction:', auctionError);
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

      const { data: bidData, error: bidError } = await supabase
        .from('trendingbids')
        .select(`
          *,
          user:bidder_id (
            id,
            email
          )
        `)
        .eq('auction_id', auctionId)
        .order('amount', { ascending: false })
        .limit(3);

      if (bidError) {
        console.error('Error fetching bids:', bidError);
        return;
      }

      setBids(bidData || []);
    } catch (err) {
      console.error('Error in fetchBids:', err);
    }
  };

  // Update useEffect to use the new fetchBids function
  useEffect(() => {
    if (isOpen && art) {
      fetchBids();
    }
  }, [art?.id, isOpen]);

  if (!isOpen || !art) return null;

  // Get the artwork image URL from either the auction or artwork object
  const imageUrl = art.artworks?.image_url || art.image_url || '/Images/placeholder-art.jpg';

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
        <h2 className="text-2xl font-serif mb-4">{art.artworks?.title || art.title}</h2>

        {/* Image */}
        <div className="mb-4">
          <img
            src={imageUrl}
            alt={art.artworks?.title || art.title}
            className="w-full h-64 object-contain bg-gray-100 rounded"
          />
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4">{art.artworks?.description || art.description}</p>

        {/* Current Price and Minimum Bid */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Current Price: <span className="font-semibold">${art.current_highest_bid || art.starting_price}</span>
          </p>
          <p className="text-sm text-gray-600">
            Minimum Bid: <span className="font-semibold">${(art.current_highest_bid || art.starting_price) + 1}</span>
          </p>
        </div>

        {/* Countdown */}
        {timeLeft?.expired ? (
          <p className="text-red-500 mb-2">Auction ended</p>
        ) : (
          <p className="text-sm mb-2 text-gray-800">
            Time Left: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </p>
        )}

        {/* Bid Input */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1">
            <input
              type="number"
              placeholder={`Min bid: $${(art.current_highest_bid || art.starting_price) + 1}`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="border px-2 py-1 w-full text-sm rounded"
              disabled={timeLeft.expired}
              min={(art.current_highest_bid || art.starting_price) + 1}
            />
          </div>
          <button
            onClick={handleBidClick}
            disabled={timeLeft.expired}
            className={`px-4 py-1 text-sm border rounded ${
              timeLeft.expired
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {user ? 'Place Bid' : 'Login to Bid'}
          </button>
        </div>

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
                    ${b.amount} by {b.user?.email || 'Anonymous'}
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
