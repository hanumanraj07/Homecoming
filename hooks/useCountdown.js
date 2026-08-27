import { useEffect, useState } from 'react';

function msRemaining(targetDate) {
  return targetDate ? new Date(targetDate).getTime() - Date.now() : 0;
}

export function useCountdown(targetDate) {
  const [remainingMs, setRemainingMs] = useState(() => msRemaining(targetDate));

  useEffect(() => {
    if (!targetDate) return undefined;

    setRemainingMs(msRemaining(targetDate));
    const interval = setInterval(() => {
      setRemainingMs(msRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const isOverdue = remainingMs <= 0;
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const label = isOverdue ? 'Overdue' : `${minutes}:${String(seconds).padStart(2, '0')}`;

  return { remainingMs, isOverdue, label };
}
