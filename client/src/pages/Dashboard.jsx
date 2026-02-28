import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CapsuleCard from '../components/CapsuleCard';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchCapsules = async () => {
    try {
      const res = await api.get('/capsules');
      setCapsules(res.data.capsules);
    } catch (err) {
      setError('Failed to load capsules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCapsules(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this capsule? This action cannot be undone.')) return;
    try {
      await api.delete(`/capsules/${id}`);
      setCapsules(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert('Failed to delete capsule.');
    }
  };

  const now = new Date();
  const filteredCapsules = capsules.filter(c => {
    if (filter === 'locked') return new Date(c.unlockDate) > now;
    if (filter === 'unlocked') return new Date(c.unlockDate) <= now;
    return true;
  });

  const stats = {
    total: capsules.length,
    locked: capsules.filter(c => new Date(c.unlockDate) > now).length,
    unlocked: capsules.filter(c => new Date(c.unlockDate) <= now).length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your time capsule collection</p>
        </div>
        <Link
          to="/create-capsule"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <span>➕</span> New Capsule
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Capsules', value: stats.total, icon: '📦', color: 'indigo' },
          { label: 'Locked', value: stats.locked, icon: '🔒', color: 'amber' },
          { label: 'Unlocked', value: stats.unlocked, icon: '🔓', color: 'green' },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800/50 rounded-xl p-1 w-fit">
        {['all', 'locked', 'unlocked'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Capsules Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 h-64 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : filteredCapsules.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">{filter === 'all' ? '📦' : filter === 'locked' ? '🔒' : '🔓'}</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {filter === 'all' ? 'No capsules yet' : `No ${filter} capsules`}
          </h3>
          <p className="text-gray-400 dark:text-gray-500 mb-6">
            {filter === 'all' ? 'Create your first time capsule to preserve your memories.' : `You don't have any ${filter} capsules.`}
          </p>
          {filter === 'all' && (
            <Link
              to="/create-capsule"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              ➕ Create Your First Capsule
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCapsules.map(capsule => (
            <CapsuleCard key={capsule._id} capsule={capsule} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
