import { useState, useEffect, useCallback } from 'react';

interface TimerState {
 timeRemaining: number;
 isRunning: boolean;
 isWarning: boolean;
 isCritical: boolean;
}

export function useGameTimer(
 initialSeconds: number,
 onComplete: () => void
): TimerState & { start: () => void; reset: (seconds?: number) => void; stop: () => void } {
 const [timeRemaining, setTimeRemaining] = useState(initialSeconds);
 const [isRunning, setIsRunning] = useState(false);

 useEffect(() => {
 if (!isRunning || timeRemaining <= 0) return;
 
 const interval = setInterval(() => {
 setTimeRemaining(t => {
 if (t <= 1) {
 clearInterval(interval);
 onComplete();
 setIsRunning(false);
 return 0;
 }
 return t - 1;
 });
 }, 1000);

 return () => clearInterval(interval);
 }, [isRunning, timeRemaining, onComplete]);

 const start = useCallback(() => setIsRunning(true), []);
 const stop = useCallback(() => setIsRunning(false), []);
 const reset = useCallback((seconds?: number) => {
 setTimeRemaining(seconds ?? initialSeconds);
 setIsRunning(false);
 }, [initialSeconds]);

 return {
 timeRemaining,
 isRunning,
 isWarning: timeRemaining <= 30 && timeRemaining > 10,
 isCritical: timeRemaining <= 10,
 start,
 stop,
 reset
 };
}
