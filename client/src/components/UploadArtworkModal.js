import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Dialog } from '@headlessui/react';

const categories = ['painting', 'sculpture', 'digital', 'photography', 'other'];
const mediums = ['oil', 'acrylic', 'watercolor', 'digital', 'bronze', 'mixed', 'other'];

const UploadArtworkModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('gallery');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('url');
  const [artistName, setArtistName] = useState('');
  const [category, setCategory] = useState('painting');
  const [medium, setMedium] = useState('oil');
  const [dimensions, setDimensions] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Auction fields
  const [startingBid, setStartingBid] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [auctionDuration, setAuctionDuration] = useState(7);
  const [startDate, setStartDate] = useState('');

  const handleFileUpload = async () => {
    if (!file) return null;
    try {
      const filename = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('images')
        .upload(`public/${filename}`, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);
      
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage('');

      // Validate required fields
      if (!title || !description || !price || (!imageUrl && !file)) {
        throw new Error('Please fill in all required fields');
      }

      // Validate auction fields if mode is auction
      if (mode === 'auction') {
        if (!startingBid || parseFloat(startingBid) <= 0) {
          throw new Error('Starting bid must be greater than zero');
        }
        if (!reservePrice || parseFloat(reservePrice) <= 0) {
          throw new Error('Reserve price must be greater than zero');
        }
        if (parseFloat(startingBid) > parseFloat(reservePrice)) {
          throw new Error('Starting bid cannot be higher than reserve price');
        }
        if (!auctionDuration || auctionDuration < 1 || auctionDuration > 30) {
          throw new Error('Auction duration must be between 1 and 30 days');
        }
      }

      const user = await supabase.auth.getUser();
      const owner_id = user.data.user?.id;
      
      if (!owner_id) {
        throw new Error('You must be logged in to upload artwork');
      }

      let finalImageUrl = imageUrl;
      if (uploadMode === 'file') {
        finalImageUrl = await handleFileUpload();
      }

      const { data: artworkData, error: artworkError } = await supabase
        .from('Artwork')
        .insert([{
          title,
          description,
          price: parseFloat(price),
          image_url: finalImageUrl,
          category,
          medium,
          dimensions,
          year: parseInt(year),
          artist_name: artistName,
          is_sold: false,
          owner_id,
        }])
        .select();

      if (artworkError || !artworkData || !artworkData[0]) {
        throw new Error('Failed to save artwork details');
      }

      const artwork_id = artworkData[0].artwork_id;

      if (mode === 'gallery') {
        const { error: galleryError } = await supabase
          .from('gallery')
          .insert([{
            artwork_id,
            featured: false,
            display_order: 1
          }]);

        if (galleryError) {
          throw new Error('Failed to add artwork to gallery');
        }

        setSuccessMessage('Artwork successfully uploaded to gallery');
      } else if (mode === 'auction') {
        // Remove from gallery if it exists (prevents duplication)
        await supabase
          .from('gallery')
          .delete()
          .eq('artwork_id', artwork_id);

        const start_time = startDate ? new Date(startDate) : new Date();
        const end_time = new Date(start_time.getTime() + auctionDuration * 24 * 60 * 60 * 1000);

        const { error: auctionError } = await supabase
          .from('auctions')
          .insert([{
            artwork_id,
            starting_price: parseFloat(startingBid),
            current_highest_bid: parseFloat(startingBid),
            start_time: start_time.toISOString(),
            end_time: end_time.toISOString(),
            status: 'active',
            reserve_price: parseFloat(reservePrice),
          }]);

        if (auctionError) {
          // If auction creation fails, delete the artwork
          await supabase
            .from('Artwork')
            .delete()
            .eq('artwork_id', artwork_id);
          throw new Error('Failed to create auction');
        }

        setSuccessMessage('Artwork successfully added to auction');
      }

      // Reset form after successful upload
      setTitle('');
      setDescription('');
      setPrice('');
      setImageUrl('');
      setFile(null);
      setArtistName('');
      setCategory('painting');
      setMedium('oil');
      setDimensions('');
      setYear(new Date().getFullYear());
      setStartingBid('');
      setReservePrice('');
      setAuctionDuration(7);
      setStartDate('');

      // Close modal after delay
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Upload Your Artwork</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {/* Upload Type Selection First */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">Upload For</label>
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value)} 
            className="w-full border p-2 rounded"
          >
            <option value="gallery">Gallery</option>
            <option value="auction">Auction</option>
          </select>
        </div>

        <label className="block mb-2 text-sm font-medium">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mb-3 border p-2 rounded" />

        <label className="block mb-2 text-sm font-medium">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mb-3 border p-2 rounded" />

        <label className="block mb-2 text-sm font-medium">Artist Name</label>
        <input value={artistName} onChange={(e) => setArtistName(e.target.value)} className="w-full mb-3 border p-2 rounded" />

        <div className="mb-3 flex gap-2">
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-2 rounded">
              {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium">Medium</label>
            <select value={medium} onChange={e => setMedium(e.target.value)} className="w-full border p-2 rounded">
              {mediums.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-3 flex gap-2">
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium">
              Dimensions <span className="text-xs text-gray-500">(e.g. 12 x 12 inches)</span>
            </label>
            <input placeholder="Width x Height (inches)" value={dimensions} onChange={e => setDimensions(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium">Year</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} className="w-full border p-2 rounded" />
          </div>
        </div>

        {/* Conditional Fields based on mode */}
        {mode === 'gallery' ? (
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">Price ($)</label>
            <input 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              className="w-full border p-2 rounded"
              min="0.01"
              step="0.01"
              required
            />
          </div>
        ) : (
          <div className="mb-4 border rounded p-3 bg-gray-50">
            <label className="block mb-2 text-sm font-medium">Starting Bid ($)</label>
            <input 
              type="number" 
              value={startingBid} 
              onChange={e => setStartingBid(e.target.value)} 
              className="w-full mb-2 border p-2 rounded"
              min="0.01"
              step="0.01"
              required
            />
            <label className="block mb-2 text-sm font-medium">Reserve Price ($)</label>
            <input 
              type="number" 
              value={reservePrice} 
              onChange={e => setReservePrice(e.target.value)} 
              className="w-full mb-2 border p-2 rounded"
              min="0.01"
              step="0.01"
              required
            />
            <label className="block mb-2 text-sm font-medium">Auction Duration (days)</label>
            <input 
              type="number" 
              value={auctionDuration} 
              min={1} 
              max={30} 
              onChange={e => setAuctionDuration(e.target.value)} 
              className="w-full mb-2 border p-2 rounded"
              required
            />
            <label className="block mb-2 text-sm font-medium">Start Date (optional)</label>
            <input 
              type="datetime-local" 
              onChange={(e) => setStartDate(e.target.value)} 
              className="w-full border p-2 rounded"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Image Source</label>
          <select value={uploadMode} onChange={(e) => setUploadMode(e.target.value)} className="mb-2 w-full border p-2 rounded">
            <option value="url">Public Image URL</option>
            <option value="file">Upload from Computer</option>
          </select>

          {uploadMode === 'url' ? (
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full border p-2 rounded" />
          ) : (
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="w-full border p-2 rounded" />
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-4 py-2 rounded bg-[#8B7355] text-white hover:bg-[#6B563D] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Submit'}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default UploadArtworkModal;
