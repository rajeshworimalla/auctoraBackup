import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Dialog } from '@headlessui/react';

const UploadArtworkModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('gallery'); // gallery or auction
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('url'); // url or file

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
    const owner_id = (await supabase.auth.getUser()).data.user.id;

    let finalImageUrl = imageUrl;
    if (uploadMode === 'file') {
      const uploadedUrl = await handleFileUpload();
      if (!uploadedUrl) return;
      finalImageUrl = uploadedUrl;
    }

    const { data, error } = await supabase.from('Artwork').insert([{
      title,
      description,
      price: parseFloat(price),
      image_url: finalImageUrl,
      category: 'painting',
      medium: 'digital',
      dimensions: 'N/A',
      year: new Date().getFullYear(),
      artist_name: 'Anonymous',
      is_sold: false,
      owner_id
    }]);

    if (error) {
      alert('Insert failed');
    } else {
      alert('Uploaded successfully');
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
            <option value="auction">Auction (coming soon)</option>
          </select>
        </div>

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded bg-[#8B7355] text-white hover:bg-[#6B563D]">Submit</button>
        </div>
      </div>
    </Dialog>
  );
};

export default UploadArtworkModal;
