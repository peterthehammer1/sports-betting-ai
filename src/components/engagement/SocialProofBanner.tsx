'use client';

import { useState, useEffect, useRef } from 'react';

interface SocialProofBannerProps {
  stats?: {
    winRate: number;
    wins: number;
    losses: number;
    netUnits: number;
  };
}

// Simulated recent activity - realistic fake data
const RECENT_ACTIVITY = [
  { type: 'win', user: 'Jake from TX', pick: 'Seahawks -4.5', time: '2m ago' },
  { type: 'follow', user: 'Sarah M.', pick: 'Patriots +4.5', time: '5m ago' },
  { type: 'win', user: 'Mike D.', pick: 'Celtics -6', time: '8m ago' },
  { type: 'parlay', user: 'Chris K.', pick: '3-leg parlay', odds: '+285', time: '12m ago' },
  { type: 'follow', user: 'Emma R.', pick: 'Super Bowl Over 47.5', time: '18m ago' },
  { type: 'win', user: 'David L.', pick: 'Bruins ML', time: '24m ago' },
  { type: 'win', user: 'Tony B.', pick: 'Warriors -4', time: '31m ago' },
  { type: 'follow', user: 'Rachel S.', pick: 'Lakers ML', time: '38m ago' },
];

export function SocialProofBanner({ stats }: SocialProofBannerProps) {
  const [displayedWinRate, setDisplayedWinRate] = useState(0);
  const [displayedWins, setDisplayedWins] = useState(0);
  const [displayedUnits, setDisplayedUnits] = useState(0);
  const [activeUsers, setActiveUsers] = useState(127);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  // Animate numbers on mount - use realistic fake stats as fallback
  useEffect(() => {
    const targetWinRate = stats?.winRate || 67.4;
    const targetWins = stats?.wins || 89;
    const targetUnits = stats?.netUnits || 47;
    
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      setDisplayedWinRate(Number((targetWinRate * eased).toFixed(1)));
      setDisplayedWins(Math.floor(targetWins * eased));
      setDisplayedUnits(Math.floor(targetUnits * eased));
      
      if (step >= steps) {
        clearInterval(timer);
        setDisplayedWinRate(targetWinRate);
        setDisplayedWins(targetWins);
        setDisplayedUnits(targetUnits);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [stats]);

  // Simulate fluctuating active users
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(95, Math.min(180, prev + change));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Rotate through recent activity
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivityIndex(prev => (prev + 1) % RECENT_ACTIVITY.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Intersection observer for visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (bannerRef.current) {
      observer.observe(bannerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const currentActivity = RECENT_ACTIVITY[currentActivityIndex];

  return (
    <div 
      ref={bannerRef}
      className="relative overflow-hidden bg-gradient-to-r from-green-900/20 via-[#161b22] to-green-900/20 border-y border-green-500/20"
    >
      {/* Animated background pulse */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5 animate-pulse" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Main Stats - Animated */}
          <div className="flex items-center gap-6">
            {/* Win Rate */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30">
                <span className="text-lg">🔥</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-green-400 tabular-nums">
                    {displayedWinRate}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">Win Rate</p>
              </div>
            </div>

            {/* Record */}
            <div className="hidden sm:block">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white tabular-nums">
                  {displayedWins}
                </span>
                <span className="text-slate-500">-</span>
                <span className="text-xl font-bold text-slate-400 tabular-nums">
                  {stats?.losses || 43}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Record</p>
            </div>

            {/* Units Profit */}
            <div className="hidden md:block">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-green-400 tabular-nums">
                  +{displayedUnits}
                </span>
                <span className="text-sm text-slate-500">units</span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">Profit</p>
            </div>
          </div>

          {/* Live Activity Ticker */}
          <div className="flex items-center gap-4">
            {/* Active Users */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-sm text-white font-medium tabular-nums">{activeUsers}</span>
              <span className="text-xs text-slate-500">viewing</span>
            </div>

            {/* Recent Activity */}
            <div 
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700 min-w-[280px] transition-all duration-500"
              key={currentActivityIndex}
            >
              <span className="text-sm">
                {currentActivity.type === 'win' ? '✅' : 
                 currentActivity.type === 'parlay' ? '🎯' : '👀'}
              </span>
              <span className="text-sm text-slate-300 truncate">
                <span className="font-medium text-white">{currentActivity.user}</span>
                {currentActivity.type === 'win' && ' just won on '}
                {currentActivity.type === 'follow' && ' started following '}
                {currentActivity.type === 'parlay' && ' hit a '}
                <span className="text-green-400 font-medium">
                  {currentActivity.pick}
                  {currentActivity.odds && ` (${currentActivity.odds})`}
                </span>
              </span>
              <span className="text-[10px] text-slate-500 flex-shrink-0">{currentActivity.time}</span>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex -space-x-2">
              {['👤', '👤', '👤', '👤'].map((_, i) => (
                <div 
                  key={i} 
                  className="w-6 h-6 rounded-full bg-slate-700 border-2 border-[#161b22] flex items-center justify-center text-xs"
                >
                  {_}
                </div>
              ))}
              <div className="w-6 h-6 rounded-full bg-green-500/20 border-2 border-[#161b22] flex items-center justify-center text-[10px] text-green-400 font-bold">
                +2k
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-white">2,847 bettors trust Pete&apos;s picks</p>
              <p className="text-[10px] text-slate-500">Join the winning team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
