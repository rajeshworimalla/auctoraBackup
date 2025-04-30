import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import ArtworkCard from '../components/ArtworkCard';
import AuctionCard from '../components/AuctionCard';
import ArtModal from '../components/ArtModal';
import GalleryModal from '../components/GalleryModal';

const ExplorePage = () => {
  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase
          .from('Artwork')
          .select('count');
        
        if (error) {
          console.error('Supabase connection error:', error);
        } else {
          console.log('Supabase connection successful, count:', data);
        }
      } catch (err) {
        console.error('Failed to connect to Supabase:', err);
      }
    };

    testConnection();
  }, []);

  const [activeTab, setActiveTab] = useState('gallery');
  const [artworks, setArtworks] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
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

  // Fetch data when component mounts or tab changes
  useEffect(() => {
    console.log('Tab changed to:', activeTab);
    if (activeTab === 'gallery') {
      fetchArtworks();
    } else {
      fetchAuctions();
    }
  }, [activeTab]);

  const fetchArtworks = async () => {
    try {
      console.log('Starting to fetch artworks...');
      setLoading(true);

      // First, get all artwork_ids that are in auctions
      const { data: auctionArtworks, error: auctionError } = await supabase
        .from('auctions')
        .select('artwork_id');

      if (auctionError) {
        console.error('Error fetching auction artworks:', auctionError);
        throw auctionError;
      }

      console.log('Auction artworks:', auctionArtworks);

      // Create array of artwork_ids that are in auctions
      const auctionArtworkIds = auctionArtworks?.map(a => a.artwork_id) || [];
      console.log('Auction artwork IDs:', auctionArtworkIds);

      // Build query for artworks
      let query = supabase
        .from('Artwork')
        .select('*')
        .eq('is_sold', false);

      if (auctionArtworkIds.length > 0) {
        query = query.not('artwork_id', 'in', `(${auctionArtworkIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching artworks:', error);
        throw error;
      }

      console.log('Raw gallery artworks:', data);

      if (!data || data.length === 0) {
        console.log('No gallery artworks found');
        setArtworks([]);
        return;
      }

      const transformedArtworks = data.map(artwork => ({
        ...artwork,
        title: artwork.title || 'Untitled',
        description: artwork.description || 'No description available',
        image_url: artwork.image_url || '/Images/placeholder-art.jpg',
        price: artwork.price || 0,
        category: artwork.category || 'Other',
        medium: artwork.medium || 'Mixed Media'
      }));

      console.log('Transformed gallery artworks:', transformedArtworks);
      setArtworks(transformedArtworks);
    } catch (error) {
      console.error('Error in fetchArtworks:', error);
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuctions = async () => {
    try {
      setLoading(true);

      // Fetch all live auctions with artwork details
      const { data: auctionsData, error: auctionsError } = await supabase
        .from('auctions')
        .select(`
          *,
          Artwork (*)
        `)
        .eq('status', 'active');

      if (auctionsError) throw auctionsError;

      // Fetch top 3 bids and total bid count for all auctions
      const auctionIds = auctionsData.map(a => a.auction_id);
      let bidCounts = {};
      let topBids = {};
      if (auctionIds.length > 0) {
        // Get total bid counts
        const { data: countData, error: countError } = await supabase
          .from('bids')
          .select('auction_id, count:bids(*)')
          .in('auction_id', auctionIds);
        if (!countError && countData) {
          countData.forEach(b => {
            bidCounts[b.auction_id] = b.count;
          });
        }
        // Get top 3 bids for each auction
        for (const auctionId of auctionIds) {
          const { data: bidsData, error: bidsError } = await supabase
            .from('bids')
            .select(`*, user:bidder_id (id, raw_user_meta_data)`)
            .eq('auction_id', auctionId)
            .order('amount', { ascending: false })
            .limit(3);
          if (!bidsError && bidsData) {
            topBids[auctionId] = bidsData;
          } else {
            topBids[auctionId] = [];
          }
        }
      }

      // Transform auction data
      const transformedAuctions = auctionsData.map(auction => {
        const artwork = auction.Artwork || {};
        return {
          auction_id: auction.auction_id,
          artwork_id: auction.artwork_id,
          starting_price: auction.starting_price || 0,
          current_highest_bid: auction.current_highest_bid || auction.starting_price,
          end_time: auction.end_time,
          start_time: auction.start_time,
          status: auction.status,
          reserve_price: auction.reserve_price,
          total_bids: bidCounts[auction.auction_id] || 0,
          top_bids: topBids[auction.auction_id] || [],
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
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  // Update the Apply Filters button click handler
  const handleApplyFilters = () => {
    setShowFilters(false);
    fetchArtworks();
  };

  // Filter section component
  const FilterSection = () => (
    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100">
        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            className={`pb-3 px-4 text-sm font-medium transition-all duration-200 border-b-2 ${
              activeFilterTab === 'basic'
                ? 'border-[#8B7355] text-[#8B7355]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveFilterTab('basic')}
          >
            Basic Filters
          </button>
          <button
            className={`pb-3 px-4 text-sm font-medium transition-all duration-200 border-b-2 ${
              activeFilterTab === 'advanced'
                ? 'border-[#8B7355] text-[#8B7355]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveFilterTab('advanced')}
          >
            Advanced Filters
          </button>
          <button
            className={`pb-3 px-4 text-sm font-medium transition-all duration-200 border-b-2 ${
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
        <div className={`space-y-4 transition-all duration-300 ${activeFilterTab === 'basic' ? 'block' : 'hidden'}`}>
          {/* Search Input */}
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
            {/* Category Filter */}
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

            {/* Medium Filter */}
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
        <div className={`space-y-4 transition-all duration-300 ${activeFilterTab === 'advanced' ? 'block' : 'hidden'}`}>
          {/* Price Range */}
          <div className="grid grid-cols-2 gap-4">
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
        <div className={`space-y-4 transition-all duration-300 ${activeFilterTab === 'sort' ? 'block' : 'hidden'}`}>
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

        {/* Apply Filters Button */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleApplyFilters}
            className="px-6 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#6B563D] transition-all duration-200"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D3CABE]"></div>
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
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <div className="col-span-full text-center py-12 text-gray-500">
                No active auctions found
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
              <div className="col-span-full text-center py-12 text-gray-500">
                No artworks found
              </div>
            )
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedItem && activeTab === 'auctions' ? (
        <ArtModal
          key={(selectedItem?.auction_id || selectedItem?.id || '') + '-' + (selectedItem ? Date.now() : '')}
          isOpen={selectedItem !== null}
          onClose={() => setSelectedItem(null)}
          art={selectedItem}
        />
      ) : (
        <GalleryModal
          isOpen={selectedItem !== null}
          onClose={() => setSelectedItem(null)}
          artwork={selectedItem}
        />
      )}
    </div>
  );
};

export default ExplorePage;
