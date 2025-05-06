import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const UploadArtworkModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    price: '',
    category: '',
    medium: '',
    dimensions: '',
    year: '',
    artist_name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;

    const { error } = await supabase.rpc('insert_artwork', {
      p_title: formData.title,
      p_description: formData.description,
      p_image_url: formData.image_url,
      p_price: parseFloat(formData.price),
      p_category: formData.category,
      p_medium: formData.medium,
      p_dimensions: formData.dimensions,
      p_year: parseInt(formData.year),
      p_artist_name: formData.artist_name,
      p_owner_id: user.id
    });

    setLoading(false);
    if (error) {
      alert('Failed to upload: ' + error.message);
    } else {
      alert('Artwork uploaded!');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">Upload New Artwork</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(formData).map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field.replace('_', ' ')}
              value={formData[field]}
              onChange={handleChange}
              required={field !== 'dimensions'}
              className="w-full border rounded px-3 py-2"
            />
          ))}
          <button
            type="submit"
            disabled={loading}
            className="bg-[#8B7355] text-white px-4 py-2 rounded hover:bg-[#6B563D]"
          >
            {loading ? 'Uploading...' : 'Submit'}
          </button>
        </form>
        <button onClick={onClose} className="mt-3 text-sm text-gray-500 underline">Cancel</button>
      </div>
    </div>
  );
};

export default UploadArtworkModal;
