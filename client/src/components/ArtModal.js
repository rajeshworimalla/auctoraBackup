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
            user:user_id (
              id,
              email
            )
          `)
          .eq('auction_id', art.id)
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
    if (isNaN(bidAmount) || bidAmount <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    const now = new Date();
    const end = new Date(art.end_time);
    if (now >= end) {
      alert('Bidding has ended for this artwork.');
      return;
    }

    try {
      console.log('Attempting to place bid:', {
        auction_id: art.id,
        amount: parseFloat(bidAmount),
        user_id: user.id // No need to parse UUID
      });

      // Start a transaction to update both the bid and auction status
      const { data: bidData, error: bidError } = await supabase
        .from('trendingbids')
        .insert([
          {
            auction_id: art.id,
            amount: parseFloat(bidAmount),
            user_id: user.id
          }
        ])
        .select();

      if (bidError) {
        console.error('Supabase error details:', bidError);
        throw bidError;
      }

      // Update the auction's current highest bid and highest bidder
      const { error: auctionError } = await supabase
        .from('auctions')
        .update({
          current_highest_bid: parseFloat(bidAmount),
          highest_bidder_id: user.id,
          status: 'active'
        })
        .eq('id', art.id);

      if (auctionError) {
        console.error('Error updating auction:', auctionError);
        throw auctionError;
      }

      console.log('Bid placed successfully:', bidData);

      const updatedBids = [...bids, bidData[0]]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      setBids(updatedBids);
      setBidAmount('');
      alert('Bid placed successfully!');
    } catch (err) {
      console.error('Detailed error when placing bid:', {
        error: err,
        message: err.message,
        details: err.details,
        hint: err.hint
      });
      alert(`Failed to place bid: ${err.message || 'Please try again.'}`);
    }
  };

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
            className="w-full h-64 object-cover rounded"
          />
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4">{art.artworks?.description || art.description}</p>

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
          <input
            type="number"
            placeholder="Your bid"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="border px-2 py-1 w-24 text-sm"
            disabled={timeLeft.expired}
          />
          <button
            onClick={handleBidClick}
            disabled={timeLeft.expired}
            className={`px-4 py-1 text-sm border ${
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
