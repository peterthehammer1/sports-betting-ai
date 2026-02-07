'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date | string;
  label?: string;
  variant?: 'compact' | 'full' | 'inline';
  onExpire?: () => void;
  showUrgency?: boolean;
}

export function CountdownTimer({ 
  targetDate, 
  label = 'Starts in',
  variant = 'compact',
  onExpire,
  showUrgency = true
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });

  useEffect(() => {
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = target.getTime() - now;

      if (difference <= 0) {
        onExpire?.();
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  const isUrgent = showUrgency && timeLeft.total > 0 && timeLeft.days === 0 && timeLeft.hours < 2;
  const isVeryUrgent = showUrgency && timeLeft.total > 0 && timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes < 30;

  if (timeLeft.total <= 0) {
    return (
      <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        Live Now
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={`text-sm font-medium tabular-nums ${
        isVeryUrgent ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-slate-400'
      }`}>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${
        isVeryUrgent ? 'bg-red-500/10 border border-red-500/30' : 
        isUrgent ? 'bg-yellow-500/10 border border-yellow-500/30' : 
        'bg-slate-800/50'
      }`}>
        {isVeryUrgent && (
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
        <span className={`text-[10px] uppercase tracking-wide ${
          isVeryUrgent ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-slate-500'
        }`}>
          {label}
        </span>
        <span className={`text-sm font-bold font-mono tabular-nums ${
          isVeryUrgent ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-white'
        }`}>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`rounded-lg p-4 ${
      isVeryUrgent ? 'bg-red-500/10 border border-red-500/30' : 
      isUrgent ? 'bg-yellow-500/10 border border-yellow-500/30' : 
      'bg-slate-800/50 border border-slate-700'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        {isVeryUrgent && (
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
        <span className={`text-xs uppercase tracking-wider font-semibold ${
          isVeryUrgent ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-slate-500'
        }`}>
          {label}
        </span>
        {isVeryUrgent && (
          <span className="text-xs text-red-400 font-medium">Hurry!</span>
        )}
      </div>
      
      <div className="flex items-center justify-center gap-3">
        {timeLeft.days > 0 && (
          <TimeUnit value={timeLeft.days} label="Days" urgent={isUrgent} veryUrgent={isVeryUrgent} />
        )}
        <TimeUnit value={timeLeft.hours} label="Hours" urgent={isUrgent} veryUrgent={isVeryUrgent} />
        <span className={`text-2xl font-bold ${isVeryUrgent ? 'text-red-400' : 'text-slate-600'}`}>:</span>
        <TimeUnit value={timeLeft.minutes} label="Mins" urgent={isUrgent} veryUrgent={isVeryUrgent} />
        <span className={`text-2xl font-bold ${isVeryUrgent ? 'text-red-400' : 'text-slate-600'}`}>:</span>
        <TimeUnit value={timeLeft.seconds} label="Secs" urgent={isUrgent} veryUrgent={isVeryUrgent} pulse />
      </div>
    </div>
  );
}

function TimeUnit({ 
  value, 
  label, 
  urgent,
  veryUrgent,
  pulse 
}: { 
  value: number; 
  label: string; 
  urgent?: boolean;
  veryUrgent?: boolean;
  pulse?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={`
        text-2xl font-bold font-mono tabular-nums 
        ${veryUrgent ? 'text-red-400' : urgent ? 'text-yellow-400' : 'text-white'}
        ${pulse && veryUrgent ? 'animate-pulse' : ''}
      `}>
        {String(value).padStart(2, '0')}
      </div>
      <div className={`text-[10px] uppercase tracking-wide ${
        veryUrgent ? 'text-red-400/70' : urgent ? 'text-yellow-400/70' : 'text-slate-500'
      }`}>
        {label}
      </div>
    </div>
  );
}

// Pick Deadline Timer - shows when lines may change
export function PickDeadline({ gameTime }: { gameTime: Date | string }) {
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'warning' | 'critical'>('normal');
  const target = typeof gameTime === 'string' ? new Date(gameTime) : gameTime;
  
  useEffect(() => {
    const checkUrgency = () => {
      const now = new Date().getTime();
      const hoursLeft = (target.getTime() - now) / (1000 * 60 * 60);
      
      if (hoursLeft < 0.5) setUrgencyLevel('critical');
      else if (hoursLeft < 2) setUrgencyLevel('warning');
      else setUrgencyLevel('normal');
    };
    
    checkUrgency();
    const interval = setInterval(checkUrgency, 60000);
    return () => clearInterval(interval);
  }, [target]);

  const messages = {
    normal: 'Lines may change before game time',
    warning: 'Lines may shift soon - lock in your pick',
    critical: 'Last chance - game starts very soon!'
  };

  const colors = {
    normal: 'text-slate-500',
    warning: 'text-yellow-500',
    critical: 'text-red-500'
  };

  return (
    <div className={`flex items-center gap-2 text-xs ${colors[urgencyLevel]}`}>
      {urgencyLevel !== 'normal' && (
        <span className={`w-1.5 h-1.5 rounded-full ${
          urgencyLevel === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'
        }`} />
      )}
      <span>{messages[urgencyLevel]}</span>
    </div>
  );
}
