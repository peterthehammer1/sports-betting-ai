'use client';

import Image from 'next/image';
import { getNbaTeam, getNhlTeam, getNflTeam, findTeamByName } from '@/lib/utils/teams';

interface TeamLogoProps {
  teamName: string;
  sport?: 'nba' | 'nhl' | 'nfl';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

const sizeMap = {
  xs: { container: 'w-4 h-4', text: 'text-[8px]' },
  sm: { container: 'w-6 h-6', text: 'text-xs' },
  md: { container: 'w-8 h-8', text: 'text-sm' },
  lg: { container: 'w-10 h-10', text: 'text-base' },
  xl: { container: 'w-12 h-12', text: 'text-lg' },
};

export function TeamLogo({ teamName, sport = 'nba', size = 'md', showName = false, className = '' }: TeamLogoProps) {
  // Get team data
  const teamData = sport === 'nba' ? getNbaTeam(teamName) : 
                   sport === 'nhl' ? getNhlTeam(teamName) : 
                   getNflTeam(teamName);
  
  const sizeClasses = sizeMap[size];
  
  if (!teamData.logo) {
    // Fallback to abbreviation
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <div 
          className={`${sizeClasses.container} rounded-full flex items-center justify-center text-white font-bold ${sizeClasses.text}`}
          style={{ backgroundColor: teamData.primary || '#2a3444' }}
        >
          {teamData.abbrev}
        </div>
        {showName && <span className="text-slate-300 font-medium">{teamName}</span>}
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className={`${sizeClasses.container} relative flex-shrink-0`}>
        <Image
          src={teamData.logo}
          alt={teamName}
          fill
          className="object-contain"
          unoptimized
        />
      </div>
      {showName && <span className="text-slate-300 font-medium">{teamName}</span>}
    </div>
  );
}

// Inline team reference for use in text/analysis
interface InlineTeamProps {
  teamName: string;
  sport?: 'nba' | 'nhl' | 'nfl';
  className?: string;
}

export function InlineTeam({ teamName, sport = 'nba', className = '' }: InlineTeamProps) {
  // Try to find team by partial name
  const team = findTeamByName(teamName, sport);
  
  if (!team?.logo) {
    return <span className={`text-slate-200 font-medium ${className}`}>{teamName}</span>;
  }
  
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="w-4 h-4 relative inline-block align-middle">
        <Image
          src={team.logo}
          alt={teamName}
          fill
          className="object-contain"
          unoptimized
        />
      </span>
      <span className="text-slate-200 font-medium">{teamName}</span>
    </span>
  );
}
