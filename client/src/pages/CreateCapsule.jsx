import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CreateCapsule = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    message: '',
    unlockDate: '',
    recipients: [''],
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    const newPreviews = selected.map(f => ({
      name: f.name,
      type: f.type.startsWith('video/') ? 'video' : 'image',
      url: URL.createObjectURL(f),
      size: (f.size / 1024 / 1024).toFixed(2),
    }));
    setPreviews(newPreviews);
  };

  const addRecipient = () => {
    setForm(prev => ({ ...prev, recipients: [...prev.recipients, ''] }));
  };

  const removeRecipient = (idx) => {
    setForm(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== idx),
    }));
  };

  const updateRecipient = (idx, value) => {
    setForm(prev => {
      const r = [...prev.recipients];
      r[idx] = value;
      return { ...prev, recipients: r };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validRecipients = form.recipients.filter(r => r.trim());
    const minDate = new Date();
    minDate.setMinutes(minDate.getMinutes() + 5);
    if (new Date(form.unlockDate) <= minDate) {
      return setError('Unlock date must be at least 5 minutes in the future.');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('message', form.message);
      formData.append('unlockDate', form.unlockDate);
      formData.append('recipients', JSON.stringify(validRecipients));
      files.forEach(f => formData.append('media', f));

      const res = await api.post('/capsules', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct);
        },
      });

      navigate(`/capsule/${res.data.capsule._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create capsule.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const minDateStr = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Create Time Capsule</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Seal your memories until a future date</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">📝 Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Give your capsule a memorable title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              maxLength={500}
              rows={2}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="A short description (optional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message to Future Self</label>
            <textarea
              maxLength={10000}
              rows={6}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Write a heartfelt message, your thoughts, dreams, goals..."
            />
          </div>
        </div>

        {/* Unlock Date */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">📅 Unlock Date</h2>
          <input
            type="datetime-local"
            required
            min={minDateStr}
            value={form.unlockDate}
            onChange={e => setForm({ ...form, unlockDate: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">The capsule will be locked until this exact date and time.</p>
        </div>

        {/* Media Upload */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">📎 Media (Optional)</h2>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors bg-gray-50 dark:bg-gray-800/50">
            <div className="text-3xl mb-1">📁</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload photos or videos</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Up to 10 files, max 100MB each</p>
            <input type="file" className="hidden" multiple accept="image/*,video/*" onChange={handleFileChange} />
          </label>
          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
              {previews.map((p, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square">
                  {p.type === 'image' ? (
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2">
                      <span className="text-3xl">🎬</span>
                      <span className="text-xs text-gray-500 truncate w-full text-center mt-1">{p.name}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 text-center">
                    {p.size}MB
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recipients */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">👥 Future Recipients (Optional)</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">These people will be emailed when the capsule unlocks.</p>
          <div className="space-y-2">
            {form.recipients.map((r, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="email"
                  value={r}
                  onChange={e => updateRecipient(i, e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="recipient@example.com"
                />
                {form.recipients.length > 1 && (
                  <button type="button" onClick={() => removeRecipient(i)} className="p-2.5 text-gray-400 hover:text-red-500 transition-colors">✕</button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addRecipient}
            className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            + Add another recipient
          </button>
        </div>

        {/* Upload progress */}
        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <div>
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-2xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
          {loading ? '⏳ Creating Capsule...' : '🔒 Seal Time Capsule'}
        </button>
        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          Once sealed, the capsule cannot be edited.
        </p>
      </form>
    </div>
  );
};

export default CreateCapsule;
