'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getPlayerHeadshot, getPlayerInitials, getPlayerNumber } from '@/lib/utils/teams';

interface PlayerAvatarProps {
  playerName: string;
  sport?: 'nba' | 'nhl' | 'nfl';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showNumber?: boolean;
  teamColor?: string;
  className?: string;
}

const sizeMap = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', number: 'text-[8px] -bottom-0.5 -right-0.5 w-3 h-3' },
  sm: { container: 'w-8 h-8', text: 'text-xs', number: 'text-[9px] -bottom-0.5 -right-0.5 w-3.5 h-3.5' },
  md: { container: 'w-10 h-10', text: 'text-sm', number: 'text-[10px] -bottom-1 -right-1 w-4 h-4' },
  lg: { container: 'w-12 h-12', text: 'text-base', number: 'text-xs -bottom-1 -right-1 w-5 h-5' },
  xl: { container: 'w-16 h-16', text: 'text-lg', number: 'text-sm -bottom-1 -right-1 w-6 h-6' },
};

export function PlayerAvatar({ 
  playerName, 
  sport = 'nba', 
  size = 'md', 
  showNumber = false,
  teamColor,
  className = '' 
}: PlayerAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const headshotUrl = getPlayerHeadshot(playerName, sport);
  const initials = getPlayerInitials(playerName);
  const number = sport === 'nba' ? getPlayerNumber(playerName) : null;
  const sizeClasses = sizeMap[size];
  
  return (
    <div className={`relative inline-block ${className}`}>
      {headshotUrl && !imageError ? (
        <div className={`${sizeClasses.container} rounded-full overflow-hidden bg-slate-700 relative`}>
          <Image
            src={headshotUrl}
            alt={playerName}
            fill
            className="object-cover object-top"
            onError={() => setImageError(true)}
            unoptimized
          />
        </div>
      ) : (
        <div 
          className={`${sizeClasses.container} rounded-full flex items-center justify-center text-white font-bold ${sizeClasses.text}`}
          style={{ backgroundColor: teamColor || '#2a3444' }}
        >
          {initials}
        </div>
      )}
      
      {/* Jersey number badge */}
      {showNumber && number && (
        <span 
          className={`absolute ${sizeClasses.number} rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-slate-300`}
        >
          {number}
        </span>
      )}
    </div>
  );
}

// Inline player reference for use in text/analysis
interface InlinePlayerProps {
  playerName: string;
  sport?: 'nba' | 'nhl' | 'nfl';
  teamColor?: string;
  className?: string;
}

export function InlinePlayer({ playerName, sport = 'nba', teamColor, className = '' }: InlinePlayerProps) {
  const [imageError, setImageError] = useState(false);
  const headshotUrl = getPlayerHeadshot(playerName, sport);
  const initials = getPlayerInitials(playerName);
  
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {headshotUrl && !imageError ? (
        <span className="w-5 h-5 rounded-full overflow-hidden bg-slate-700 relative inline-block align-middle flex-shrink-0">
          <Image
            src={headshotUrl}
            alt={playerName}
            fill
            className="object-cover object-top"
            onError={() => setImageError(true)}
            unoptimized
          />
        </span>
      ) : (
        <span 
          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
          style={{ backgroundColor: teamColor || '#2a3444' }}
        >
          {initials}
        </span>
      )}
      <span className="text-slate-200 font-medium">{playerName}</span>
    </span>
  );
}
