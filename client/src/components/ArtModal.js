// ArtModal.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ArtModal = ({ isOpen, onClose, art }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [bids, setBids] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});

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
      console.log("🖼️ Fetching bids for art ID:", art?.id);
      if (art?.id && isOpen) {
        try {
          const res = await axios.get(`http://localhost:5000/api/bids/${art.id}`);

          const sorted = (res.data.bids || [])
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3); // Top 3

          setBids(sorted);
        } catch (err) {
          console.error('Error fetching bids:', err);
        }
      }
    };

    fetchBids();
  }, [art?.id, isOpen]);

  // 📤 Submit New Bid
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
      const res = await axios.post('http://localhost:5000/api/bids', {
        artId: art.id,
        amount: bidAmount,
        user: 'Guest',
      });

      const updatedBids = [...bids, res.data.bid]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      setBids(updatedBids);
      setBidAmount('');
      alert('Bid placed!');
    } catch (err) {
      console.error('Error placing bid:', err);
      alert('Failed to place bid');
    }
  };

  if (!isOpen || !art) return null;

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
        <h2 className="text-2xl font-serif mb-4">{art.title}</h2>

        {/* Images */}
        <div className="flex overflow-x-auto space-x-4 mb-4">
          {art.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={art.title}
              className="w-40 h-40 object-cover rounded"
            />
          ))}
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4">{art.description}</p>

        {/* Countdown */}
        {timeLeft?.expired ? (
          <p className="text-red-500 mb-2">Auction ended</p>
        ) : (
          <p className="text-sm mb-2 text-gray-800">
            Time Left: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </p>
        )}

        {/* Bid Input */}
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="number"
            placeholder="Your bid"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            className="border px-2 py-1 w-24 text-sm"
            disabled={timeLeft.expired}
          />
          <button
            onClick={handleBid}
            disabled={timeLeft.expired}
            className={`px-4 py-1 text-sm border ${
              timeLeft.expired
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            Place Bid
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
                <li key={i}>
                  🪙 ${b.amount} {i === 0 && <span className="text-yellow-500 font-bold">★ Highest</span>}
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
