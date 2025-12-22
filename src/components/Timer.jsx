import React, { useEffect } from 'react';

const Timer = ({ timeRemaining, onTimeUp }) => {
  useEffect(() => {
    if (timeRemaining <= 0 && onTimeUp) {
      onTimeUp();
    }
  }, [timeRemaining, onTimeUp]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTimerClass = () => {
    if (timeRemaining < 120) {
      return 'text-red-400 animate-pulse';
    } else if (timeRemaining < 600) {
      return 'text-amber-400';
    }
    return 'text-white';
  };

  const getIconClass = () => {
    if (timeRemaining < 120) {
      return 'text-red-400';
    } else if (timeRemaining < 600) {
      return 'text-amber-400';
    }
    return 'text-cyan-400';
  };

  return (
    <div className="flex items-center gap-3">
      <svg className={`w-6 h-6 ${getIconClass()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className={`text-2xl font-mono font-bold ${getTimerClass()}`}>
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
};

export default Timer;
