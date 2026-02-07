'use client';

import { useState, useEffect } from 'react';

// Types
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface UserStats {
  streak: number;
  totalPicks: number;
  wins: number;
  longestStreak: number;
  badges: Badge[];
}

// Streak Tracker Component
export function StreakTracker({ currentStreak }: { currentStreak: number }) {
  const [displayStreak, setDisplayStreak] = useState(0);

  useEffect(() => {
    // Animate the streak number
    const duration = 1000;
    const steps = 20;
    const interval = duration / steps;
    const increment = currentStreak / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= currentStreak) {
        setDisplayStreak(currentStreak);
        clearInterval(timer);
      } else {
        setDisplayStreak(Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [currentStreak]);

  const getStreakEmoji = (streak: number) => {
    if (streak >= 10) return '🏆';
    if (streak >= 7) return '🔥';
    if (streak >= 5) return '⚡';
    if (streak >= 3) return '🎯';
    return '📈';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 10) return 'from-yellow-500 to-orange-500';
    if (streak >= 7) return 'from-orange-500 to-red-500';
    if (streak >= 5) return 'from-green-500 to-emerald-500';
    if (streak >= 3) return 'from-blue-500 to-cyan-500';
    return 'from-slate-500 to-slate-400';
  };

  if (currentStreak < 2) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">
            📈
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Start your streak!</p>
            <p className="text-xs text-slate-500">Win your next pick to begin</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r ${getStreakColor(currentStreak)} p-[1px] rounded-lg`}>
      <div className="bg-[#161b22] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getStreakColor(currentStreak)} flex items-center justify-center text-2xl animate-pulse`}>
              {getStreakEmoji(currentStreak)}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white tabular-nums">
                  {displayStreak}
                </span>
                <span className="text-sm text-slate-400">game streak</span>
              </div>
              <p className="text-xs text-slate-500">
                {currentStreak >= 10 ? 'Legendary!' : 
                 currentStreak >= 7 ? 'On fire! Keep it going!' : 
                 currentStreak >= 5 ? 'Hot streak!' :
                 currentStreak >= 3 ? 'Building momentum!' : 'Great start!'}
              </p>
            </div>
          </div>
          
          {/* Streak milestones */}
          <div className="hidden sm:flex items-center gap-1">
            {[3, 5, 7, 10].map(milestone => (
              <div 
                key={milestone}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStreak >= milestone
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-slate-800 text-slate-600 border border-slate-700'
                }`}
              >
                {milestone}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Badge Display Component
export function BadgeDisplay({ badges }: { badges: Badge[] }) {
  const earned = badges.filter(b => b.earned);
  const unearned = badges.filter(b => !b.earned);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Achievements</h3>
        <span className="text-sm text-slate-500">
          {earned.length}/{badges.length} earned
        </span>
      </div>

      {/* Earned badges */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {earned.map(badge => (
          <div
            key={badge.id}
            className="flex flex-col items-center gap-1 p-2 bg-slate-800/50 border border-yellow-500/30 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group"
            title={badge.description}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              {badge.icon}
            </span>
            <span className="text-[10px] text-slate-400 text-center truncate w-full">
              {badge.name}
            </span>
          </div>
        ))}
        
        {/* Unearned badges (grayed out) */}
        {unearned.map(badge => (
          <div
            key={badge.id}
            className="flex flex-col items-center gap-1 p-2 bg-slate-900/50 border border-slate-800 rounded-lg opacity-40 cursor-help"
            title={`${badge.name}: ${badge.description}`}
          >
            <span className="text-2xl grayscale">
              {badge.icon}
            </span>
            <span className="text-[10px] text-slate-600 text-center truncate w-full">
              {badge.name}
            </span>
            {badge.progress !== undefined && badge.maxProgress && (
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-600 rounded-full"
                  style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Default badges - Realistic progress for newer site
export const DEFAULT_BADGES: Badge[] = [
  { id: 'first_pick', name: 'First Pick', description: 'Make your first pick', icon: '🎯', earned: true },
  { id: 'first_win', name: 'First Win', description: 'Win your first bet', icon: '✅', earned: true },
  { id: 'streak_3', name: 'Hot Hand', description: '3-game win streak', icon: '🔥', earned: true },
  { id: 'streak_5', name: 'On Fire', description: '5-game win streak', icon: '⚡', earned: true },
  { id: 'streak_10', name: 'Legendary', description: '10-game win streak', icon: '🏆', earned: false, progress: 5, maxProgress: 10 },
  { id: 'picks_10', name: 'Regular', description: 'Make 10 picks', icon: '📊', earned: true },
  { id: 'picks_50', name: 'Dedicated', description: 'Make 50 picks', icon: '💪', earned: true },
  { id: 'picks_100', name: 'Veteran', description: 'Make 100 picks', icon: '🎖️', earned: false, progress: 89, maxProgress: 100 },
  { id: 'underdog', name: 'Underdog Hunter', description: 'Win 5 underdog bets', icon: '🐕', earned: true },
  { id: 'parlay', name: 'Parlay King', description: 'Hit a 3+ leg parlay', icon: '👑', earned: true },
  { id: 'roi_positive', name: 'In The Green', description: 'Maintain positive ROI', icon: '💰', earned: true },
  { id: 'daily', name: 'Daily Player', description: 'Visit 7 days in a row', icon: '📅', earned: false, progress: 4, maxProgress: 7 },
];

// Pick Follow Button
export function FollowPickButton({ 
  pickId, 
  onFollow 
}: { 
  pickId: string; 
  onFollow?: (pickId: string) => void;
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFollow = () => {
    setIsAnimating(true);
    setIsFollowing(!isFollowing);
    onFollow?.(pickId);
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <button
      onClick={handleFollow}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
        ${isFollowing 
          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600'
        }
        ${isAnimating ? 'scale-105' : ''}
      `}
    >
      <span className={`transition-transform ${isAnimating ? 'scale-125' : ''}`}>
        {isFollowing ? '✓' : '+'}
      </span>
      {isFollowing ? 'Following' : 'Follow Pick'}
    </button>
  );
}

// Mini Leaderboard - Realistic fake data
export function MiniLeaderboard() {
  const [users] = useState([
    { rank: 1, name: 'Pete\'s AI', streak: 5, winRate: 67.4, avatar: '🤖' },
    { rank: 2, name: 'SharpShooter', streak: 4, winRate: 64.2, avatar: '🔥' },
    { rank: 3, name: 'BetKing', streak: 3, winRate: 61.8, avatar: '👑' },
    { rank: 4, name: 'MoneyMike', streak: 3, winRate: 59.5, avatar: '💰' },
    { rank: 5, name: 'LuckyLisa', streak: 2, winRate: 58.1, avatar: '🍀' },
  ]);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Top Bettors This Week</h3>
        <span className="text-xs text-slate-500">By win rate</span>
      </div>
      
      <div className="divide-y divide-slate-800">
        {users.map(user => (
          <div 
            key={user.rank} 
            className={`px-4 py-2.5 flex items-center gap-3 ${
              user.rank === 1 ? 'bg-yellow-500/5' : ''
            }`}
          >
            <span className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${user.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                user.rank === 2 ? 'bg-slate-400/20 text-slate-300' :
                user.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                'bg-slate-800 text-slate-500'}
            `}>
              {user.rank}
            </span>
            
            <span className="text-lg">{user.avatar}</span>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500">{user.streak} game streak</p>
            </div>
            
            <span className="text-sm font-bold text-green-400 tabular-nums">
              {user.winRate}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
