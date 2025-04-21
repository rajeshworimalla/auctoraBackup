import React, { useState, useEffect } from 'react';
import { FiClock, FiTrendingUp } from 'react-icons/fi';

const AuctionCard = ({ auction, onClick }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(auction.end_time).getTime();
      const distance = end - now;

      if (distance <= 0) {
        setTimeLeft({ expired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
        expired: false
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [auction.end_time]);

  if (!timeLeft) return null;

  const artwork = auction.artworks || {};
  const currentBid = auction.current_highest_bid || auction.starting_price;
  const totalBids = auction.total_bids || 0;

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={() => onClick(auction)}
    >
      {/* Image Container */}
      <div className="relative h-48 w-full">
        <img
          src={artwork.image_url || '/Images/placeholder-art.jpg'}
          alt={artwork.title}
          className="w-full h-full object-cover"
        />
        {/* Status Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
          timeLeft.expired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {timeLeft.expired ? 'Ended' : 'Live'}
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-serif font-medium text-gray-900 line-clamp-1">
            {artwork.title || 'Untitled'}
          </h3>
        </div>

        {/* Current Bid */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500">Current Bid</p>
            <p className="text-lg font-medium text-[#8B7355]">${currentBid}</p>
          </div>
          <div className="flex items-center text-gray-500">
            <FiTrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">{totalBids} bids</span>
          </div>
        </div>

        {/* Time Left */}
        {!timeLeft.expired ? (
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <FiClock className="w-4 h-4" />
            <span>
              {timeLeft.days > 0 && `${timeLeft.days}d `}
              {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
            </span>
          </div>
        ) : (
          <p className="text-sm text-red-500">Auction has ended</p>
        )}

        {/* Artist/Category */}
        <div className="mt-2 flex justify-between items-center">
          <span className="text-sm text-gray-500 capitalize">
            {artwork.category || 'Mixed Media'}
          </span>
          <span className="text-xs text-gray-400">
            {artwork.artist_name || 'Unknown Artist'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard; 