import React from 'react';
import { formatTimeLeft } from '../utils/timeUtils';
import { formatCurrency } from '../utils/formatCurrency';

const AuctionCard = ({ auction, onClick }) => {
  const {
    auction_id,
    artwork,
    starting_price,
    current_highest_bid,
    end_time,
    status,
    total_bids
  } = auction;

  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
      onClick={() => onClick(auction)}
    >
      {/* Image Container */}
      <div className="relative w-full pt-[100%]">
        <img
          src={artwork.image_url}
          alt={artwork.title}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full font-medium text-sm ${
              status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {status === 'active' ? 'Live' : 'Ended'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {artwork.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {artwork.artist_name}
        </p>
        <p className="text-sm text-gray-500 mb-3">
          {artwork.category} • {artwork.medium}
        </p>

        {/* Time and Bid Info */}
        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-gray-600">
              {status === 'active' ? 'Time Left:' : 'Ended:'}
            </p>
            <p className="font-medium text-gray-900">
              {formatTimeLeft(end_time)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">Current Bid:</p>
            <p className="font-medium text-gray-900">
              {formatCurrency(current_highest_bid || starting_price)}
            </p>
          </div>
        </div>

        {/* Total Bids */}
        <div className="mt-3 text-sm text-gray-500">
          {total_bids} {total_bids === 1 ? 'bid' : 'bids'}
        </div>
      </div>
    </div>
  );
};

export default AuctionCard; 