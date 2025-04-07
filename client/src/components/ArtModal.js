// ArtModal.js
import React from 'react';

const ArtModal = ({ isOpen, onClose, art }) => {
  if (!isOpen) return null;

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

        {/* Art Title */}
        <h2 className="text-2xl font-serif mb-4">{art.title}</h2>

        {/* Images (Carousel-like) */}
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

        {/* Place Bid Button */}
        <button className="border border-black px-4 py-2 hover:bg-black hover:text-white transition text-sm">
          Place a Bid
        </button>
      </div>
    </div>
  );
};

export default ArtModal;
