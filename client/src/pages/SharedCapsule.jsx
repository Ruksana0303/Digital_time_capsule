import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const SharedCapsule = () => {
  const { token } = useParams();
  const { darkMode, toggleDarkMode } = useTheme();
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/capsules/share/${token}`);
        setCapsule(res.data.capsule);
      } catch (err) {
        if (err.response?.data?.locked) {
          setLocked(true);
          setError(err.response.data.message);
        } else {
          setError(err.response?.data?.message || 'Failed to load capsule.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 p-4">
      <button onClick={toggleDarkMode} className="fixed top-4 right-4 p-2 rounded-xl bg-white dark:bg-gray-800 shadow-md text-lg z-50">
        {darkMode ? '☀️' : '🌙'}
      </button>

      <div className="max-w-2xl mx-auto pt-12">
        <div className="text-center mb-8">
          <span className="text-4xl">⏳</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Digital Time Capsule</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">A message from the past</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
            <div className="text-5xl mb-4">{locked ? '🔒' : '😕'}</div>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <Link to="/login" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
              Sign in to create your own capsule
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-green-200 dark:border-green-800 p-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
                  🔓 Opened
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{capsule?.title}</h2>
              {capsule?.description && (
                <p className="text-gray-500 dark:text-gray-400 mt-1">{capsule.description}</p>
              )}
            </div>

            {capsule?.message && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">💌 Message</h3>
                <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-4 border-l-4 border-indigo-400">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{capsule.message}</p>
                </div>
              </div>
            )}

            {capsule?.media?.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">📸 Media</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {capsule.media.map((m, i) => (
                    <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square hover:opacity-90 transition-opacity">
                      {m.type === 'image' ? (
                        <img src={m.url} alt={m.originalName || `Media ${i+1}`} className="w-full h-full object-cover" />
                      ) : (
                        <video src={m.url} className="w-full h-full object-cover" controls />
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sealed on {new Date(capsule?.createdAt).toLocaleDateString()} · Unlocked on {new Date(capsule?.unlockDate).toLocaleDateString()}
              </p>
              <Link to="/register" className="mt-3 inline-block text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium">
                ✨ Create your own time capsule
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedCapsule;
