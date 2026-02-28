import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ScheduledMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ recipientEmail: '', subject: '', message: '', deliveryDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMessages = async () => {
    try {
      const res = await api.get('/scheduled-messages');
      setMessages(res.data.messages);
    } catch {
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/scheduled-messages', form);
      setSuccess('Message scheduled successfully!');
      setForm({ recipientEmail: '', subject: '', message: '', deliveryDate: '' });
      setShowForm(false);
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule message.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scheduled message?')) return;
    try {
      await api.delete(`/scheduled-messages/${id}`);
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.');
    }
  };

  const minDate = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Scheduled Messages</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Send messages to the future</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
        >
          {showForm ? '✕ Cancel' : '➕ Schedule Message'}
        </button>
      </div>

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-2xl text-sm">
          ✅ {success}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">📬 New Scheduled Message</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Recipient Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={form.recipientEmail}
                  onChange={e => setForm({ ...form, recipientEmail: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Delivery Date <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  required
                  min={minDate}
                  value={form.deliveryDate}
                  onChange={e => setForm({ ...form, deliveryDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="Message subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                placeholder="Your message..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70"
            >
              {submitting ? 'Scheduling...' : '📬 Schedule Message'}
            </button>
          </form>
        </div>
      )}

      {/* Messages List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 h-24 animate-pulse" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📬</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No scheduled messages</h3>
          <p className="text-gray-400 dark:text-gray-500">Schedule a message to be sent to someone in the future.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg._id} className={`bg-white dark:bg-gray-900 rounded-2xl border p-5 ${
              msg.delivered ? 'border-green-200 dark:border-green-800' : 'border-gray-200 dark:border-gray-800'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      msg.delivered
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                    }`}>
                      {msg.delivered ? '✅ Delivered' : '⏳ Pending'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      To: {msg.recipientEmail}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{msg.subject}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{msg.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {msg.delivered
                      ? `Delivered on ${new Date(msg.deliveredAt).toLocaleString()}`
                      : `Scheduled for ${new Date(msg.deliveryDate).toLocaleString()}`
                    }
                  </p>
                </div>
                {!msg.delivered && (
                  <button
                    onClick={() => handleDelete(msg._id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduledMessages;
