import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ unlockDate, onUnlock }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const unlock = new Date(unlockDate);
      const diff = unlock - now;

      if (diff <= 0) {
        setTimeLeft({ unlocked: true });
        if (onUnlock) onUnlock();
        return;
      }

      const totalMs = unlock - new Date(Math.min(now, unlock));
      const progressPct = Math.max(0, Math.min(100, ((Date.now() - (unlock - totalMs)) / totalMs) * 100));

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });

      // Progress from creation to unlock (approximate based on time remaining vs 365 days)
      const maxDays = 365 * 24 * 60 * 60 * 1000;
      const prog = Math.min(100, Math.max(0, 100 - (diff / maxDays * 100)));
      setProgress(prog);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [unlockDate]);

  if (timeLeft.unlocked) {
    return (
      <div className="text-center">
        <div className="text-3xl font-bold text-green-500 mb-2">🎉 Unlocked!</div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div className="bg-green-500 h-3 rounded-full w-full transition-all duration-300"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { value: timeLeft.days, label: 'Days' },
          { value: timeLeft.hours, label: 'Hours' },
          { value: timeLeft.minutes, label: 'Min' },
          { value: timeLeft.seconds, label: 'Sec' },
        ].map(({ value, label }) => (
          <div key={label} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {String(value ?? 0).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
