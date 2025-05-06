import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Dialog } from '@headlessui/react';

const categories = [
  'painting',
  'sculpture',
  'digital',
  'photography',
  'other',
];
const mediums = [
  'oil',
  'acrylic',
  'watercolor',
  'digital',
  'bronze',
  'mixed',
  'other',
];

const UploadArtworkModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('gallery'); // gallery or auction
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('url'); // url or file
  const [artistName, setArtistName] = useState('');
  const [category, setCategory] = useState('painting');
  const [medium, setMedium] = useState('oil');
  const [dimensions, setDimensions] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  // Auction fields
  const [startingBid, setStartingBid] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [auctionDuration, setAuctionDuration] = useState(7); // days

  const handleFileUpload = async () => {
    if (!file) return null;
    const filename = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('artworks')
      .upload(filename, file);
    if (error) {
      alert('Upload failed');
      return null;
    }
    const { publicUrl } = supabase.storage.from('artworks').getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async () => {
    const user = await supabase.auth.getUser();
    const owner_id = user.data.user?.id || null;
    let finalImageUrl = imageUrl;
    if (uploadMode === 'file') {
      const uploadedUrl = await handleFileUpload();
      if (!uploadedUrl) return;
      finalImageUrl = uploadedUrl;
    }
    // Insert into Artwork
    const { data: artworkData, error: artworkError } = await supabase.from('Artwork').insert([
      {
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
      },
    ]).select();
    if (artworkError || !artworkData || !artworkData[0]) {
      alert('Insert failed');
      return;
    }
    const artwork_id = artworkData[0].artwork_id;
    if (mode === 'gallery') {
      // Insert into gallery
      await supabase.from('gallery').insert([
        { artwork_id, featured: false, display_order: 1 },
      ]);
      alert('Uploaded successfully to gallery');
      onClose();
    } else if (mode === 'auction') {
      // Insert into auctions
      const now = new Date();
      const end = new Date(now.getTime() + auctionDuration * 24 * 60 * 60 * 1000);
      await supabase.from('auctions').insert([
        {
          artwork_id,
          starting_price: parseFloat(startingBid),
          current_highest_bid: parseFloat(startingBid),
          start_time: now.toISOString(),
          end_time: end.toISOString(),
          status: 'active',
          reserve_price: parseFloat(reservePrice),
        },
      ]);
      alert('Uploaded successfully to auction');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Upload Your Artwork</h2>

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
            <label className="block mb-2 text-sm font-medium">Dimensions</label>
            <input value={dimensions} onChange={e => setDimensions(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium">Year</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} className="w-full border p-2 rounded" />
          </div>
        </div>

        <label className="block mb-2 text-sm font-medium">Price ($)</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full mb-3 border p-2 rounded" />

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

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Upload For</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} className="w-full border p-2 rounded">
            <option value="gallery">Gallery</option>
            <option value="auction">Auction</option>
          </select>
        </div>

        {mode === 'auction' && (
          <div className="mb-4 border rounded p-3 bg-gray-50">
            <label className="block mb-2 text-sm font-medium">Starting Bid ($)</label>
            <input type="number" value={startingBid} onChange={e => setStartingBid(e.target.value)} className="w-full mb-2 border p-2 rounded" />
            <label className="block mb-2 text-sm font-medium">Reserve Price ($)</label>
            <input type="number" value={reservePrice} onChange={e => setReservePrice(e.target.value)} className="w-full mb-2 border p-2 rounded" />
            <label className="block mb-2 text-sm font-medium">Auction Duration (days)</label>
            <input type="number" value={auctionDuration} min={1} max={30} onChange={e => setAuctionDuration(e.target.value)} className="w-full border p-2 rounded" />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded bg-[#8B7355] text-white hover:bg-[#6B563D]">Submit</button>
        </div>
      </div>
    </Dialog>
  );
};

export default UploadArtworkModal;
