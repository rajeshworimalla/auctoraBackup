import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Checkout = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    phoneNumber: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
    billingAddressLine1: '',
    billingAddressLine2: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    billingCountry: 'USA'
  });

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            *,
            artwork:artwork_id (
              title,
              image_url,
              artist_name,
              price
            )
          `)
          .eq('user_id', user.id);

        if (error) throw error;
        setCartItems(data || []);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, []);

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: shippingData, error: shippingError } = await supabase
        .from('shipping_info')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user.id,
          full_name: shippingInfo.fullName,
          address_line1: shippingInfo.addressLine1,
          address_line2: shippingInfo.addressLine2,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postal_code: shippingInfo.postalCode,
          country: shippingInfo.country,
          phone_number: shippingInfo.phoneNumber
        })
        .select()
        .single();

      if (shippingError) throw shippingError;

      setCurrentStep(2);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_info')
        .insert({
          user_id: user.id,
          card_number: paymentInfo.cardNumber,
          card_holder_name: paymentInfo.cardHolderName,
          expiry_date: paymentInfo.expiryDate,
          cvv: paymentInfo.cvv,
          billing_address_line1: paymentInfo.billingAddressLine1,
          billing_address_line2: paymentInfo.billingAddressLine2,
          billing_city: paymentInfo.billingCity,
          billing_state: paymentInfo.billingState,
          billing_postal_code: paymentInfo.billingPostalCode,
          billing_country: paymentInfo.billingCountry
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      setCurrentStep(3);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;

      // 1. Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: cartItems.reduce((total, item) => total + (item.artwork.price * item.quantity), 0),
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order_items for each cart item
      for (const item of cartItems) {
        await supabase.from('order_items').insert({
          order_id: orderData.id,
          artwork_id: item.artwork_id,
          quantity: item.quantity,
          price_at_time: item.artwork.price
        });
      }

      // 3. Clear cart
      await supabase.from('cart_items').delete().eq('user_id', user.id);

      // 4. Show success
      setOrderSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D3CABE] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step
                      ? 'bg-[#8B7355] text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-24 h-1 ${
                      currentStep > step ? 'bg-[#8B7355]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-600">Shipping</span>
            <span className="text-sm text-gray-600">Payment</span>
            <span className="text-sm text-gray-600">Confirmation</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {orderSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg shadow mb-8 text-center">
            <h2 className="text-2xl font-bold text-green-700 mb-2">Order Placed Successfully!</h2>
            <p className="text-green-700 mb-4">Thank you for your purchase. You can view your order status and history in your purchases.</p>
            <button
              onClick={() => navigate('/purchases')}
              className="bg-[#8B7355] text-white px-6 py-2 rounded hover:bg-[#6B563D] transition-colors"
            >
              Show Purchases
            </button>
          </div>
        )}

        {/* Step 1: Shipping Information */}
        {currentStep === 1 && (
          <form onSubmit={handleShippingSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                  value={shippingInfo.fullName}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                  value={shippingInfo.addressLine1}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine1: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                  value={shippingInfo.addressLine2}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, addressLine2: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                    value={shippingInfo.state}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                    value={shippingInfo.postalCode}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                    value={shippingInfo.phoneNumber}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phoneNumber: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B7355] text-white py-2 px-4 rounded-md hover:bg-[#6B563D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B7355] disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Payment Information */}
        {currentStep === 2 && (
          <form onSubmit={handlePaymentSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Card Number</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                  value={paymentInfo.cardNumber}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Card Holder Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                  value={paymentInfo.cardHolderName}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, cardHolderName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                    value={paymentInfo.expiryDate}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">CVV</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                    value={paymentInfo.cvv}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Billing Address</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                      value={paymentInfo.billingAddressLine1}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, billingAddressLine1: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                      value={paymentInfo.billingAddressLine2}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, billingAddressLine2: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                        value={paymentInfo.billingCity}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, billingCity: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                        value={paymentInfo.billingState}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, billingState: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8B7355] focus:ring-[#8B7355]"
                      value={paymentInfo.billingPostalCode}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, billingPostalCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B7355] text-white py-2 px-4 rounded-md hover:bg-[#6B563D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B7355] disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Review Order'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Order Confirmation */}
        {!orderSuccess && currentStep === 3 && (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-center text-[#8B7355]">Order Confirmation</h2>
            
            {/* Order Summary */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {/* Items List */}
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.artwork_id} className="flex items-start space-x-4 py-4 border-b border-gray-200 last:border-0">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={item.artwork.image_url || '/Images/placeholder-art.jpg'}
                          alt={item.artwork.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="text-base font-medium text-gray-900">{item.artwork.title}</h4>
                            <p className="text-sm text-gray-500">by {item.artwork.artist_name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-medium text-gray-900">
                              ${(item.artwork.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${item.artwork.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${cartItems.reduce((total, item) => total + (item.artwork.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${(cartItems.reduce((total, item) => total + (item.artwork.price * item.quantity), 0) * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>${(cartItems.reduce((total, item) => total + (item.artwork.price * item.quantity), 0) * 1.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping To */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">Shipping To</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><span className="font-medium">Name:</span> {shippingInfo.fullName}</p>
                <p><span className="font-medium">Address:</span> {shippingInfo.addressLine1} {shippingInfo.addressLine2}</p>
                <p><span className="font-medium">City/State:</span> {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}</p>
                <p><span className="font-medium">Phone:</span> {shippingInfo.phoneNumber}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-2">Payment Info</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><span className="font-medium">Card:</span> **** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                <p><span className="font-medium">Name:</span> {paymentInfo.cardHolderName}</p>
              </div>
            </div>

            <button
              onClick={handleOrderSubmit}
              disabled={loading}
              className="w-full bg-[#8B7355] text-white py-3 rounded-lg hover:bg-[#6B563D] text-lg font-semibold transition-colors"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout; 