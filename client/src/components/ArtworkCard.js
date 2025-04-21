import React from 'react';
import { FiHeart } from 'react-icons/fi';

const ArtworkCard = ({ artwork, onClick }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={() => onClick(artwork)}
    >
      {/* Image Container */}
      <div className="relative h-48 w-full">
        <img
          src={artwork.image_url || '/Images/placeholder-art.jpg'}
          alt={artwork.title}
          className="w-full h-full object-cover"
        />
        <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200">
          <FiHeart className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Content Container */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-serif font-medium text-gray-900 line-clamp-1">
            {artwork.title || 'Untitled'}
          </h3>
          <span className="text-sm font-medium text-[#8B7355]">
            ${artwork.price || artwork.starting_price || 'Price on request'}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {artwork.description || 'No description available'}
        </p>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <span className="capitalize">{artwork.category || 'Mixed Media'}</span>
            {artwork.dimensions && (
              <span className="before:content-['•'] before:mx-2">{artwork.dimensions}</span>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {artwork.year || 'Year unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArtworkCard; 