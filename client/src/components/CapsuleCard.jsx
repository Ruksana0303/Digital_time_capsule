import React from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';

const CapsuleCard = ({ capsule, onDelete }) => {
  const isUnlocked = new Date(capsule.unlockDate) <= new Date();
  const unlockDate = new Date(capsule.unlockDate);

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
      isUnlocked
        ? 'border-green-200 dark:border-green-800'
        : 'border-gray-200 dark:border-gray-800'
    }`}>
      {/* Header */}
      <div className={`px-5 pt-5 pb-3 ${isUnlocked ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30' : 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30'}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${
              isUnlocked
                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400'
            }`}>
              {isUnlocked ? '🔓 Unlocked' : '🔒 Locked'}
            </span>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{capsule.title}</h3>
          </div>
          {capsule.media?.length > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
              📎 {capsule.media.length} file{capsule.media.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {capsule.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{capsule.description}</p>
        )}
      </div>

      {/* Countdown */}
      <div className="px-5 py-4">
        {isUnlocked ? (
          <div className="text-sm text-green-600 dark:text-green-400 font-medium text-center py-2">
            🎉 This capsule is now open!
          </div>
        ) : (
          <CountdownTimer unlockDate={capsule.unlockDate} />
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
          {isUnlocked ? 'Unlocked on' : 'Unlocks on'}: {unlockDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2">
        <Link
          to={`/capsule/${capsule._id}`}
          className="flex-1 text-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {isUnlocked ? '📖 Open Capsule' : '👁 View Details'}
        </Link>
        <button
          onClick={() => onDelete(capsule._id)}
          className="py-2 px-3 bg-gray-100 hover:bg-red-100 dark:bg-gray-800 dark:hover:bg-red-900/40 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 text-sm rounded-xl transition-colors"
          title="Delete capsule"
        >
          🗑
        </button>
      </div>
    </div>
  );
};

export default CapsuleCard;
