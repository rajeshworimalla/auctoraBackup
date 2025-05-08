import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import ArtworkCard from '../components/ArtworkCard';
import AuctionCard from '../components/AuctionCard';
import ArtModal from '../components/ArtModal';
import GalleryModal from '../components/GalleryModal';
import UploadArtworkModal from '../components/UploadArtworkModal';
import { Link } from 'react-router-dom';

const ExplorePage = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('auctions');
  const [artworks, setArtworks] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);
  const [user, setUser] = useState(null);

  const [activeFilterTab, setActiveFilterTab] = useState('basic');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    medium: '',
    minPrice: '',
    maxPrice: '',
    artist: '',
    sortBy: 'newest'
  });

  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('Artwork')
          .select('count');
        
        if (error) throw error;
        console.log('Supabase connection successful');
      } catch (err) {
        console.error('Failed to connect to Supabase:', err);
        setError('Failed to connect to database. Please try again later.');
      }
    };

    testConnection();
  }, []);

  // Fetch data when component mounts or tab changes
  useEffect(() => {
    console.log('[DEBUG] activeTab changed to:', activeTab);
    if (activeTab === 'gallery') {
      fetchArtworks();
    } else {
      fetchAuctions();
    }
  }, [activeTab]);
  
  // Add effect to fetch data when showMyListings changes
  useEffect(() => {
    if (activeTab === 'gallery') {
      fetchArtworks();
    } else {
      fetchAuctions();
    }
  }, [showMyListings]);

  // Add useEffect to get user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const fetchArtworks = async () => {
    try {
      setLoading(true);
      setError(null);
  
      console.log('[DEBUG] Starting to fetch gallery items...');
  
      // Correct join: gallery.artwork_id → Artwork.artwork_id
      let query = supabase
  .from('gallery')
  .select(`
    gallery_id,
    artwork_id,
    featured,
    display_order,
    created_at,
    Artwork:artwork_id (
      artwork_id,
      title,
      price,
      medium,
      category,
      image_url,
      owner_id,
      artist_name,
      description
    )
  `);

  
      // Apply filters
      if (filters.search) {
        query = query.ilike('Artwork.title', `%${filters.search}%`);
      }
      if (filters.category) {
        query = query.eq('Artwork.category', filters.category);
      }
      if (filters.medium) {
        query = query.eq('Artwork.medium', filters.medium);
      }
      if (filters.minPrice) {
        query = query.gte('Artwork.price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('Artwork.price', filters.maxPrice);
      }
  
      if (showMyListings && user) {
        query = query.eq('Artwork.owner_id', user.id);
      }
  
      // Apply sorting
      switch (filters.sortBy) {
        case 'price_low':
          query = query.order('Artwork.price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('Artwork.price', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
      }
  
      const { data: galleryData, error: galleryError } = await query;
  
      if (galleryError) {
        console.error('[DEBUG] Gallery fetch error:', galleryError.message, galleryError.details);
        throw galleryError;
      }
  
      console.log('[DEBUG] Raw gallery data:', galleryData);
  
      if (!galleryData || galleryData.length === 0) {
        console.log('[DEBUG] No items found in gallery table');
        setArtworks([]);
        return;
      }
  
      const mappedArtworks = galleryData.map(item => ({
        ...item.Artwork,
        gallery_id: item.id,
        featured: item.featured,
        display_order: item.display_order
      }));
  
      console.log('[DEBUG] Mapped artworks:', mappedArtworks);
      setArtworks(mappedArtworks);
    } catch (error) {
      console.error('[DEBUG] Error in fetchArtworks():', error.message || error);
      setError('Failed to fetch artworks. Please try again.');
    } finally {
      setLoading(false);
    }
  };
   const fetchAuctions = async () => {
    console.log('[DEBUG] fetchAuctions() called');
  
    try {
      setLoading(true);
      setError(null);
  
  

      const { data: { user } } = await supabase.auth.getUser();
      let query = supabase
        .from('auctions')
        .select(`
          *,
          Artwork (*)
        `)
        .eq('status', 'active')
        .gt('end_time', new Date().toISOString());

      // Apply filters
      if (filters.search) {
        query = query.ilike('Artwork.title', `%${filters.search}%`);
      }
      if (filters.category) {
        query = query.eq('Artwork.category', filters.category);
      }
      if (filters.medium) {
        query = query.eq('Artwork.medium', filters.medium);
      }
      if (filters.minPrice) {
        query = query.gte('starting_price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('starting_price', filters.maxPrice);
      }

      if (showMyListings && user) {
        query = query.eq('Artwork.owner_id', user.id);
      }
      
      // Apply sorting
      switch (filters.sortBy) {
        case 'ending_soon':
          query = query.order('end_time', { ascending: true });
          break;
        case 'most_bids':
          // This would require a subquery or additional processing
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data: auctionsData, error: auctionsError } = await query;

      if (auctionsError) throw auctionsError;

      // Fetch bid information
      const auctionIds = auctionsData.map(a => a.auction_id);
      const bidPromises = auctionIds.map(async (auctionId) => {
        const [countResult, topBidsResult] = await Promise.all([
          supabase
            .from('bids')
            .select('count')
            .eq('auction_id', auctionId)
            .single(),
          supabase
            .from('bids')
            .select(`*, users:bidder_id (User_Id, Username, Phone)`)

            .eq('auction_id', auctionId)
            .order('amount', { ascending: false })
            .limit(3)
        ]);

        return {
          auctionId,
          count: countResult.data?.count || 0,
          topBids: topBidsResult.data || []
        };
        
      });

      const bidResults = await Promise.all(bidPromises);
      const bidMap = bidResults.reduce((acc, { auctionId, count, topBids }) => {
        acc[auctionId] = { count, topBids };
        return acc;
      }, {});

      // Transform auction data
      const transformedAuctions = auctionsData.map(auction => {
        const artwork = auction.Artwork || {};
        const bidInfo = bidMap[auction.auction_id] || { count: 0, topBids: [] };
        
        return {
          auction_id: auction.auction_id,
          artwork_id: auction.artwork_id,
          starting_price: auction.starting_price || 0,
          current_highest_bid: auction.current_highest_bid || auction.starting_price,
          end_time: auction.end_time,
          start_time: auction.start_time,
          status: auction.status,
          reserve_price: auction.reserve_price,
          total_bids: bidInfo.count,
          top_bids: bidInfo.topBids,
          artwork: {
            ...artwork,
            title: artwork.title || 'Untitled',
            description: artwork.description || 'No description available',
            image_url: artwork.image_url || '/Images/placeholder-art.jpg',
            category: artwork.category || 'Other',
            medium: artwork.medium || 'Mixed Media',
            artist_name: artwork.artist_name
          }
        };
      });

      setAuctions(transformedAuctions);
    } catch (error) {
      console.error('Auction fetch error:', error);
      setError('Failed to fetch auctions. Please try again later.');
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleBidUpdate = (auctionId, newBid) => {
    setAuctions(prevAuctions => 
      prevAuctions.map(auction => 
        auction.auction_id === auctionId 
          ? { ...auction, current_highest_bid: newBid }
          : auction
      )
    );
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    if (activeTab === 'gallery') {
      fetchArtworks();
    } else {
      fetchAuctions();
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      medium: '',
      minPrice: '',
      maxPrice: '',
      artist: '',
      sortBy: 'newest'
    });
  };

  // Filter section component
  const FilterSection = () => (
    showFilters && (
      <div className="transition-all duration-300 ease-in-out block">
        {/* Overlay for mobile to close filter panel when clicking outside */}
        <div
          className="fixed inset-0 bg-black bg-opacity-10 md:hidden z-40"
          onClick={() => setShowFilters(false)}
        />
        <div className="h-full md:h-auto overflow-y-auto md:overflow-visible relative z-50">
          <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100 max-w-4xl mx-auto md:mx-0">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            {/* Filter Tabs */}
            <div className="flex space-x-4 mb-6">
              <button
                className={`pb-3 px-4 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeFilterTab === 'basic'
                    ? 'border-[#8B7355] text-[#8B7355]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveFilterTab('basic')}
              >
                Basic Filters
              </button>
              <button
                className={`pb-3 px-4 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeFilterTab === 'advanced'
                    ? 'border-[#8B7355] text-[#8B7355]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveFilterTab('advanced')}
              >
                Advanced Filters
              </button>
              <button
                className={`pb-3 px-4 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeFilterTab === 'sort'
                    ? 'border-[#8B7355] text-[#8B7355]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveFilterTab('sort')}
              >
                Sort & Order
              </button>
            </div>

            {/* Basic Filters */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search artworks..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D3CABE] focus:border-transparent transition-all duration-200"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D3CABE] focus:border-transparent appearance-none transition-all duration-200 pr-10"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="">All Categories</option>
                    <option value="painting">Painting</option>
                    <option value="sculpture">Sculpture</option>
                    <option value="digital">Digital Art</option>
                    <option value="photography">Photography</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D3CABE] focus:border-transparent appearance-none transition-all duration-200 pr-10"
                    value={filters.medium}
                    onChange={(e) => setFilters({ ...filters, medium: e.target.value })}
                  >
                    <option value="">All Mediums</option>
                    <option value="oil">Oil</option>
                    <option value="acrylic">Acrylic</option>
                    <option value="watercolor">Watercolor</option>
                    <option value="digital">Digital</option>
                    <option value="mixed">Mixed Media</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
            {/* Advanced Filters */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Min Price"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D3CABE] focus:border-transparent transition-all duration-200"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Max Price"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D3CABE] focus:border-transparent transition-all duration-200"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>
              </div>
            </div>
            {/* Sort Options */}
            <div className="space-y-4">
              <div className="relative">
                <select
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#D3CABE] focus:border-transparent appearance-none transition-all duration-200 pr-10"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="price_low">Price: Low to High</option>
                  {activeTab === 'auctions' && (
                    <>
                      <option value="ending_soon">Ending Soon</option>
                      <option value="most_bids">Most Bids</option>
                    </>
                  )}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            {/* Filter Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200"
              >
                Reset Filters
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#6B563D] transition-all duration-200"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Error</p>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4 md:mb-0">
            Explore Artworks
          </h1>

          {/* Buttons container */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
            >
              {showFilters ? (
                <>
                  <FiX className="w-5 h-5 mr-2" />
                  Close Filters
                </>
              ) : (
                <>
                  <FiFilter className="w-5 h-5 mr-2" />
                  Show Filters
                </>
              )}
            </button>

            {user && (
              <>
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
                >
                  Upload Your Artwork
                </button>

                <button
                  onClick={() => setShowMyListings(!showMyListings)}
                  className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium"
                >
                  {showMyListings ? 'Show All Listings' : 'Show My Active Listings'}
                </button>
              </>
            )}
          </div>
        </div>

        <UploadArtworkModal isOpen={showUpload} onClose={() => setShowUpload(false)} />

        {/* Tab Switcher */}
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-6 py-3 rounded-lg font-medium text-lg transition-all duration-200 ${
              activeTab === 'auctions'
                ? 'bg-[#8B7355] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('auctions')}
          >
            Live Auctions
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-medium text-lg transition-all duration-200 ${
              activeTab === 'gallery'
                ? 'bg-[#8B7355] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('gallery')}
          >
            Gallery
          </button>
        </div>

        {/* Filters */}
        <FilterSection />

        {/* Content Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'auctions' ? (
            auctions.length > 0 ? (
              auctions.map((auction) => (
                <AuctionCard
                  key={auction.auction_id}
                  auction={auction}
                  onClick={handleItemClick}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                {showMyListings ? (
                  <div className="bg-white rounded-lg p-8 shadow-sm">
                    <p className="text-gray-600 mb-4">You don't have any active listings.</p>
                    <Link 
                      to="/my-listings" 
                      className="text-[#8B7355] hover:text-[#6B563D] font-medium"
                    >
                      View all your listings in your profile
                    </Link>
                  </div>
                ) : (
                  <div className="text-gray-500">No active auctions found</div>
                )}
              </div>
            )
          ) : (
            artworks.length > 0 ? (
              artworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.artwork_id}
                  artwork={artwork}
                  onClick={handleItemClick}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                {showMyListings ? (
                  <div className="bg-white rounded-lg p-8 shadow-sm">
                    <p className="text-gray-600 mb-4">You don't have any active listings.</p>
                    <Link 
                      to="/my-listings" 
                      className="text-[#8B7355] hover:text-[#6B563D] font-medium"
                    >
                      View all your listings in your profile
                    </Link>
                  </div>
                ) : (
                  <div className="text-gray-500">No artworks found</div>
                )}
              </div>
            )
          )}
        </div>

        {/* Modals */}
        {selectedItem && (
          activeTab === 'auctions' ? (
            <ArtModal
              key={(selectedItem?.auction_id || selectedItem?.id || '') + '-' + Date.now()}
              isOpen={true}
              onClose={() => setSelectedItem(null)}
              art={selectedItem}
              onBidUpdate={handleBidUpdate}
            />
          ) : (
            <GalleryModal
              isOpen={true}
              onClose={() => setSelectedItem(null)}
              artwork={selectedItem}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ExplorePage;