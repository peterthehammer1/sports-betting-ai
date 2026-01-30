'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { TeamInjuries, PlayerInjury, SportInjuries } from '@/types/injuries';
import { getNbaTeam, getNhlTeam, getNflTeam, getPlayerHeadshot } from '@/lib/utils/teams';

interface InjuryReportProps {
  sport: 'NBA' | 'NHL' | 'NFL';
  filterTeams?: string[]; // Optional: only show injuries for specific teams
  compact?: boolean; // Compact mode for sidebar/widget
  onInjuryCountChange?: (count: number) => void;
}

export function InjuryReport({ sport, filterTeams, compact = false, onInjuryCountChange }: InjuryReportProps) {
  const [injuries, setInjuries] = useState<SportInjuries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInjuries() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/injuries?sport=${sport}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch injuries');
        }
        
        const data = await response.json();
        setInjuries(data);
        
        // Calculate filtered count
        let count = data.totalInjuries || 0;
        if (filterTeams && filterTeams.length > 0) {
          count = (data.teams || [])
            .filter((t: TeamInjuries) => 
              filterTeams.some(ft => 
                t.teamName.toLowerCase().includes(ft.toLowerCase()) ||
                ft.toLowerCase().includes(t.teamName.split(' ').pop()?.toLowerCase() || '')
              )
            )
            .reduce((sum: number, t: TeamInjuries) => sum + t.injuries.length, 0);
        }
        
        onInjuryCountChange?.(count);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load injuries');
      } finally {
        setIsLoading(false);
      }
    }

    fetchInjuries();
  }, [sport, filterTeams, onInjuryCountChange]);

  // Filter teams if specified
  const displayTeams = filterTeams && filterTeams.length > 0
    ? (injuries?.teams || []).filter(t =>
        filterTeams.some(ft =>
          t.teamName.toLowerCase().includes(ft.toLowerCase()) ||
          ft.toLowerCase().includes(t.teamName.split(' ').pop()?.toLowerCase() || '')
        )
      )
    : injuries?.teams || [];

  // Get team colors based on sport
  const getTeamColors = (teamName: string) => {
    if (sport === 'NBA') return getNbaTeam(teamName);
    if (sport === 'NHL') return getNhlTeam(teamName);
    return getNflTeam(teamName);
  };

  // Get status styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Out':
      case 'Injured Reserve':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Doubtful':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Questionable':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Probable':
      case 'Day-To-Day':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Get severity indicator
  const getSeverityIndicator = (severity: string) => {
    switch (severity) {
      case 'high':
        return <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="High Impact" />;
      case 'medium':
        return <span className="w-2 h-2 rounded-full bg-yellow-500" title="Medium Impact" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-gray-500" title="Low Impact" />;
    }
  };

  const totalDisplayedInjuries = displayTeams.reduce((sum, t) => sum + t.injuries.length, 0);
  const highImpactCount = displayTeams.reduce(
    (sum, t) => sum + t.injuries.filter(i => i.severity === 'high').length,
    0
  );

  if (isLoading) {
    return (
      <div className="bg-[#1a1f2e] rounded-xl border border-[#2a3444] p-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-[#2a3444] animate-pulse" />
          <div className="h-5 w-32 bg-[#2a3444] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1f2e] rounded-xl border border-red-500/30 p-4">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (totalDisplayedInjuries === 0) {
    return (
      <div className="bg-[#1a1f2e] rounded-xl border border-[#2a3444] p-4">
        <div className="flex items-center gap-2 text-[#8a919c]">
          <span className="text-lg">✓</span>
          <span className="text-sm">No injuries reported for {filterTeams ? 'these teams' : sport}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-[#2a3444] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#242938] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🏥</span>
          <div className="text-left">
            <h3 className="font-semibold text-white">
              Injury Report
              {filterTeams && filterTeams.length > 0 && (
                <span className="text-[#8a919c] font-normal text-sm ml-2">
                  ({filterTeams.join(' vs ')})
                </span>
              )}
            </h3>
            <p className="text-xs text-[#8a919c]">
              {totalDisplayedInjuries} {totalDisplayedInjuries === 1 ? 'player' : 'players'} listed
              {highImpactCount > 0 && (
                <span className="text-red-400 ml-2">
                  • {highImpactCount} key {highImpactCount === 1 ? 'player' : 'players'} out
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Injury count badge */}
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            highImpactCount > 0 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-[#2a3444] text-[#8a919c]'
          }`}>
            {totalDisplayedInjuries}
          </div>
          
          {/* Expand/collapse arrow */}
          <svg
            className={`w-5 h-5 text-[#8a919c] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Injury List */}
      {isExpanded && (
        <div className="border-t border-[#2a3444]">
          {displayTeams.map((team) => {
            if (team.injuries.length === 0) return null;
            
            const teamColors = getTeamColors(team.teamName);
            
            return (
              <div key={team.teamName} className="border-b border-[#2a3444] last:border-b-0">
                {/* Team Header */}
                <div 
                  className="px-4 py-2 flex items-center gap-2"
                  style={{ backgroundColor: `${teamColors.primary}15` }}
                >
                  {teamColors.logo && (
                    <Image
                      src={teamColors.logo}
                      alt={team.teamName}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  )}
                  <span className="font-medium text-white text-sm">{team.teamName}</span>
                  <span className="text-xs text-[#8a919c]">({team.injuries.length})</span>
                  {team.keyPlayersOut > 0 && (
                    <span className="ml-auto text-xs text-red-400">
                      {team.keyPlayersOut} key out
                    </span>
                  )}
                </div>
                
                {/* Player Injuries */}
                <div className="divide-y divide-[#2a3444]/50">
                  {team.injuries
                    .sort((a, b) => {
                      // Sort by severity first (high > medium > low)
                      const severityOrder = { high: 0, medium: 1, low: 2 };
                      return severityOrder[a.severity] - severityOrder[b.severity];
                    })
                    .map((injury) => (
                      <InjuryRow key={injury.id} injury={injury} sport={sport} compact={compact} />
                    ))}
                </div>
              </div>
            );
          })}
          
          {/* Last Updated */}
          {injuries?.lastUpdated && (
            <div className="px-4 py-2 text-xs text-[#8a919c] bg-[#242938]/50">
              Last updated: {new Date(injuries.lastUpdated).toLocaleString()}
              {injuries.fromCache && ' (cached)'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Individual injury row component
function InjuryRow({ injury, sport, compact }: { injury: PlayerInjury; sport: string; compact: boolean }) {
  const [imageError, setImageError] = useState(false);
  const headshotUrl = getPlayerHeadshot(injury.playerName, sport.toLowerCase() as 'nba' | 'nhl' | 'nfl');
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Out':
      case 'Injured Reserve':
        return 'bg-red-500/20 text-red-400';
      case 'Doubtful':
        return 'bg-orange-500/20 text-orange-400';
      case 'Questionable':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Probable':
      case 'Day-To-Day':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getSeverityDot = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className={`px-4 ${compact ? 'py-2' : 'py-3'} flex items-center gap-3 hover:bg-[#242938]/30 transition-colors`}>
      {/* Severity indicator */}
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getSeverityDot(injury.severity)} ${
        injury.severity === 'high' ? 'animate-pulse' : ''
      }`} />
      
      {/* Player photo */}
      {!compact && (
        <div className="w-10 h-10 rounded-full bg-[#2a3444] overflow-hidden flex-shrink-0">
          {headshotUrl && !imageError ? (
            <Image
              src={headshotUrl}
              alt={injury.playerName}
              width={40}
              height={40}
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#8a919c] text-sm font-medium">
              {injury.playerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
        </div>
      )}
      
      {/* Player info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white text-sm truncate">{injury.playerName}</span>
          <span className="text-xs text-[#8a919c]">({injury.position})</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-[#8a919c]">{injury.injuryType}</span>
          {injury.details && !compact && (
            <span className="text-xs text-[#6a717c] truncate">• {injury.details}</span>
          )}
        </div>
      </div>
      
      {/* Status badge */}
      <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${getStatusStyle(injury.status)}`}>
        {injury.status}
      </span>
    </div>
  );
}

// Compact badge component for use in GameCard
export function InjuryBadge({ count, hasKeyPlayers }: { count: number; hasKeyPlayers: boolean }) {
  if (count === 0) return null;
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      hasKeyPlayers 
        ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    }`}>
      <span>🏥</span>
      <span>{count}</span>
    </div>
  );
}

// Game-specific injury summary component
interface GameInjurySummaryProps {
  homeTeam: string;
  awayTeam: string;
  sport: 'NBA' | 'NHL' | 'NFL';
}

export function GameInjurySummary({ homeTeam, awayTeam, sport }: GameInjurySummaryProps) {
  return (
    <InjuryReport 
      sport={sport} 
      filterTeams={[homeTeam, awayTeam]} 
      compact={false}
    />
  );
}
