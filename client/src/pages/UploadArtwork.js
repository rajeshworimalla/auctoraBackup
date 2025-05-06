import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const UploadArtworkModal = ({ isOpen, onClose, user }) => {
  const [form, setForm] = useState({
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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error } = await supabase.rpc('insert_artwork', {
      p_title: form.title,
      p_description: form.description,
      p_image_url: form.image_url,
      p_price: parseFloat(form.price),
      p_category: form.category,
      p_medium: form.medium,
      p_dimensions: form.dimensions,
      p_year: parseInt(form.year),
      p_artist_name: form.artist_name,
      p_owner_id: user.id
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setForm({
        title: '', description: '', image_url: '', price: '', category: '',
        medium: '', dimensions: '', year: '', artist_name: ''
      });
      if (onClose) onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-xl relative shadow-xl">
        <h2 className="text-2xl font-semibold mb-4">Upload Your Artwork</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {['title', 'description', 'image_url', 'price', 'category', 'medium', 'dimensions', 'year', 'artist_name'].map((field) => (
            <input
              key={field}
              type={field === 'price' || field === 'year' ? 'number' : 'text'}
              name={field}
              placeholder={field.replace('_', ' ').toUpperCase()}
              value={form[field]}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          ))}
          <button type="submit" disabled={loading} className="bg-[#8B7355] text-white px-6 py-2 rounded-md">
            {loading ? 'Uploading...' : 'Submit'}
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
          {success && <p className="text-green-600 mt-2">Artwork uploaded successfully!</p>}
        </form>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600">&times;</button>
      </div>
    </div>
  );
};

export default UploadArtworkModal;
