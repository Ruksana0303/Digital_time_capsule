import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';
import api from '../utils/api';

const CapsuleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(true);
  const [shareLink, setShareLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const fetchCapsule = async () => {
    try {
      const res = await api.get(`/capsules/${id}`);
      setCapsule(res.data.capsule);
      setLocked(res.data.locked);
      if (!res.data.locked && res.data.capsule.shareToken) {
        setShareLink(`${window.location.origin}/capsule/share/${res.data.capsule.shareToken}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load capsule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCapsule(); }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this capsule? This cannot be undone.')) return;
    try {
      await api.delete(`/capsules/${id}`);
      navigate('/dashboard');
    } catch {
      alert('Failed to delete.');
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const regenerateToken = async () => {
    setRegenerating(true);
    try {
      const res = await api.post(`/capsules/${id}/regenerate-token`);
      const newLink = `${window.location.origin}/capsule/share/${res.data.shareToken}`;
      setShareLink(newLink);
      setCapsule(prev => ({ ...prev, shareToken: res.data.shareToken, shareExpiry: res.data.shareExpiry }));
    } catch {
      alert('Failed to regenerate link.');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-red-500">{error}</p>
        <Link to="/dashboard" className="mt-4 inline-block text-indigo-600 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500">
          ← Back
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              !locked ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'
            }`}>
              {!locked ? '🔓 Unlocked' : '🔒 Locked'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{capsule?.title}</h1>
          {capsule?.description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">{capsule.description}</p>
          )}
        </div>
        <button onClick={handleDelete} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          🗑
        </button>
      </div>

      {/* Countdown or Content */}
      {locked ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔒</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">This capsule is locked</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Opens on {new Date(capsule.unlockDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <CountdownTimer unlockDate={capsule.unlockDate} onUnlock={fetchCapsule} />
        </div>
      ) : (
        <>
          {/* Message */}
          {capsule?.message && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">💌 Message</h2>
              <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-4 border-l-4 border-indigo-400">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{capsule.message}</p>
              </div>
            </div>
          )}

          {/* Media */}
          {capsule?.media?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">📸 Media</h2>
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

          {/* Share Link */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">🔗 Share Link</h2>
            {capsule?.shareExpiry && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                ⚠️ Link expires on {new Date(capsule.shareExpiry).toLocaleDateString()}
              </p>
            )}
            <div className="flex gap-2">
              <input
                readOnly
                value={shareLink}
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-400"
              />
              <button
                onClick={copyShareLink}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  copySuccess ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copySuccess ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <button
              onClick={regenerateToken}
              disabled={regenerating}
              className="mt-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {regenerating ? 'Regenerating...' : '🔄 Regenerate link (extends expiry 30 days)'}
            </button>
          </div>
        </>
      )}

      {/* Metadata */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">ℹ️ Details</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Created</span>
            <span className="text-gray-900 dark:text-white">{new Date(capsule?.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Unlock Date</span>
            <span className="text-gray-900 dark:text-white">{new Date(capsule?.unlockDate).toLocaleDateString()}</span>
          </div>
          {capsule?.recipients?.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Recipients</span>
              <span className="text-gray-900 dark:text-white">{capsule.recipients.length}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Media Files</span>
            <span className="text-gray-900 dark:text-white">{capsule?.media?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapsuleDetail;
