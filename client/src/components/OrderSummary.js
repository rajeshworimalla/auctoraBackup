import React from 'react';
import { FiTrash2 } from 'react-icons/fi';

const OrderSummary = ({ items, onRemoveItem }) => {
  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const shipping = 10.00; // Example shipping cost
  const tax = calculateSubtotal() * 0.1; // 10% tax
  const total = calculateSubtotal() + shipping + tax;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
      
      {/* Items List */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.artwork_id} className="flex items-start space-x-4 py-4 border-b border-gray-100">
            {/* Thumbnail */}
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src={item.image_url || '/Images/placeholder-art.jpg'}
                alt={item.title}
                className="w-full h-full object-cover rounded-md"
              />
            </div>

            {/* Item Details */}
            <div className="flex-grow">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">by {item.artist_name}</p>
                  <p className="text-sm text-gray-500">Category: {item.category}</p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.artwork_id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Price and Quantity */}
              <div className="mt-2 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Qty: {item.quantity}</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${calculateSubtotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        className="w-full mt-6 bg-[#8B7355] text-white py-3 px-4 rounded-lg hover:bg-[#6B563D] transition-colors"
        onClick={() => {/* Handle checkout */}}
      >
        Proceed to Checkout
      </button>
    </div>
  );
};

export default OrderSummary; 