import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiSave, FiX } from 'react-icons/fi';

// Array of avatar options
const avatarOptions = [
  // Male avatars
  { id: 1, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male1&gender=male&hair=short' },
  { id: 2, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male2&gender=male&hair=buzz' },
  { id: 3, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male3&gender=male&hair=fade' },
  { id: 4, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male4&gender=male&hair=mohawk' },
  { id: 5, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male5&gender=male&hair=dreads' },
  { id: 6, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=male6&gender=male&hair=frizzle' },
  // Female avatars
  { id: 7, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female1&gender=female&hair=long' },
  { id: 8, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female2&gender=female&hair=curly' },
  { id: 9, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=female3&gender=female&hair=bob' }
];

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

const getAvatarUrl = (user) => {
  if (!user) return 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
  return user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatar);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    bio: '',
    phone: '',
    avatar_url: defaultAvatar
  });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const currentAvatar = user.user_metadata?.avatar_url || defaultAvatar;
        setFormData({
          username: user.user_metadata?.username || '',
          fullName: user.user_metadata?.full_name || '',
          bio: user.user_metadata?.bio || '',
          phone: user.user_metadata?.phone || '',
          avatar_url: currentAvatar
        });
        setSelectedAvatar(currentAvatar);
      }
    } catch (error) {
      console.error('Error fetching user:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSelect = (avatarUrl) => {
    setSelectedAvatar(avatarUrl);
    setFormData(prev => ({ ...prev, avatar_url: avatarUrl }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          username: formData.username,
          full_name: formData.fullName,
          bio: formData.bio,
          phone: formData.phone,
          avatar_url: selectedAvatar
        }
      });

      if (error) throw error;

      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setEditing(false);
      getProfile(); // Refresh the profile data
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ text: error.message, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D3CABE] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D3CABE] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-[#8B7355] p-6 text-white">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Profile</h1>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#8B7355] rounded-lg hover:bg-gray-100 transition-colors"
              >
                {editing ? (
                  <>
                    <FiX className="w-5 h-5" />
                    Cancel
                  </>
                ) : (
                  <>
                    <FiEdit2 className="w-5 h-5" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {message.text && (
              <div
                className={`p-4 rounded-lg mb-6 ${
                  message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Section */}
              <div className="flex-shrink-0">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#8B7355] mx-auto bg-white">
                  <img
                    src={getAvatarUrl(user)}
                    alt="Profile"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {editing && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Choose an Avatar</h3>
                    <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                      {avatarOptions.map((avatar) => (
                        <button
                          key={avatar.id}
                          onClick={() => handleAvatarSelect(avatar.url)}
                          className={`w-16 h-16 p-1 rounded-full border-2 transition-all bg-white ${
                            selectedAvatar === avatar.url
                              ? 'border-[#8B7355] scale-110'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={avatar.url}
                            alt={`Avatar ${avatar.id}`}
                            className="w-full h-full rounded-full"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Form */}
              <div className="flex-grow">
                {editing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-6 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#6B5A45] transition-colors"
                      >
                        <FiSave className="w-5 h-5" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Username</h3>
                        <p className="mt-1 text-lg text-gray-900">{formData.username || 'Not set'}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                        <p className="mt-1 text-lg text-gray-900">{formData.fullName || 'Not set'}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                      <p className="mt-1 text-lg text-gray-900">{formData.bio || 'No bio added yet'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                      <p className="mt-1 text-lg text-gray-900">{formData.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-lg text-gray-900">{user?.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
