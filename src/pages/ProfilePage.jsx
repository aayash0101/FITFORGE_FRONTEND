import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiSave } from 'react-icons/fi';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (form.newPassword && form.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      const { data } = await api.put('/auth/profile', payload);
      setUser(data.user);
      toast.success('Profile updated!');
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black text-white mb-8">My Profile</h1>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8 bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="w-20 h-20 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center">
          <FiUser size={32} className="text-orange-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl">{user?.name}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <span className={`mt-1 inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
            user?.role === 'admin'
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
              : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
          }`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          <hr className="border-gray-800" />
          <p className="text-gray-500 text-sm">Leave password fields empty to keep current password</p>

          {/* Current Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Current Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                name="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat new password"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <FiSave size={16} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;