import React from 'react';
import { useEffect, useState } from 'react';
import { FiClock, FiTrendingUp } from 'react-icons/fi';

const AuctionCard = ({ auction, onClick }) => {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    if (!auction?.end_time) return;

    const calculateTimeLeft = () => {
      const end = new Date(auction.end_time).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance <= 0) {
        setTimeLeft({ expired: true });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((distance / 1000 / 60) % 60),
          seconds: Math.floor((distance / 1000) % 60),
          expired: false,
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [auction?.end_time]);

  if (!auction) return null;

  // Log the auction data when rendering
  console.log('Rendering auction in AuctionCard:', auction);

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={() => onClick(auction)}
    >
      {/* Image Container */}
      <div className="relative h-48 w-full">
        <img
          src={auction.image_url || '/Images/placeholder-art.jpg'}
          alt={auction.title}
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
            {auction.title || 'Untitled'}
          </h3>
          <span className="text-sm font-medium text-[#8B7355]">
            ${auction.current_highest_bid || auction.starting_price}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {auction.description || 'No description available'}
        </p>

        {/* Time Left and Bids */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">
            {timeLeft.expired ? (
              'Auction ended'
            ) : (
              `${timeLeft.days || 0}d ${timeLeft.hours || 0}h ${timeLeft.minutes || 0}m`
            )}
          </span>
          <span className="text-gray-500">
            {auction.total_bids} bid{auction.total_bids !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard; 