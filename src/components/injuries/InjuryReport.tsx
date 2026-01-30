'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { TeamInjuries, PlayerInjury, SportInjuries } from '@/types/injuries';
import { getNbaTeam, getNhlTeam, getNflTeam, getPlayerHeadshot } from '@/lib/utils/teams';

interface InjuryReportProps {
  sport: 'NBA' | 'NHL' | 'NFL';
  filterTeams?: string[]; // Optional: only show injuries for specific teams (today's games)
  onInjuryCountChange?: (count: number) => void;
}

export function InjuryReport({ sport, filterTeams, onInjuryCountChange }: InjuryReportProps) {
  const [injuries, setInjuries] = useState<SportInjuries | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        
        // Calculate filtered count for today's games only
        let count = 0;
        if (filterTeams && filterTeams.length > 0 && data.teams) {
          count = data.teams
            .filter((t: TeamInjuries) => matchTeam(t.teamName, filterTeams))
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

  // Match team name flexibly
  const matchTeam = (teamName: string, teamsToMatch: string[]) => {
    const normalizedTeamName = teamName.toLowerCase();
    return teamsToMatch.some(t => {
      const normalizedMatch = t.toLowerCase();
      // Try various matching strategies
      return normalizedTeamName.includes(normalizedMatch) ||
             normalizedMatch.includes(normalizedTeamName) ||
             normalizedTeamName.includes(normalizedMatch.split(' ').pop() || '') ||
             normalizedMatch.includes(normalizedTeamName.split(' ').pop() || '');
    });
  };

  // Filter to only teams playing today
  const teamsWithInjuries = filterTeams && filterTeams.length > 0
    ? (injuries?.teams || []).filter(t => matchTeam(t.teamName, filterTeams))
    : [];

  // Count high impact injuries
  const highImpactCount = teamsWithInjuries.reduce(
    (sum, t) => sum + t.injuries.filter(i => 
      i.severity === 'high' && (i.status === 'Out' || i.status === 'Injured Reserve')
    ).length,
    0
  );

  const totalInjuredPlayers = teamsWithInjuries.reduce((sum, t) => sum + t.injuries.length, 0);

  // Get team colors
  const getTeamColors = (teamName: string) => {
    if (sport === 'NBA') return getNbaTeam(teamName);
    if (sport === 'NHL') return getNhlTeam(teamName);
    return getNflTeam(teamName);
  };

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1a1f2e] rounded-lg border border-[#2a3444]">
        <div className="w-4 h-4 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Loading injuries...</span>
      </div>
    );
  }

  if (error || totalInjuredPlayers === 0) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1a1f2e] rounded-lg border border-[#2a3444]">
        <span className="text-sm">✓</span>
        <span className="text-xs text-slate-400">No major injuries for today&apos;s games</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Compact Badge - Click to expand */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
          highImpactCount > 0
            ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
            : 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20'
        }`}
      >
        <span className="text-sm">🏥</span>
        <span className={`text-xs font-medium ${highImpactCount > 0 ? 'text-red-400' : 'text-yellow-400'}`}>
          {totalInjuredPlayers} {totalInjuredPlayers === 1 ? 'injury' : 'injuries'}
          {highImpactCount > 0 && (
            <span className="text-red-400 ml-1">({highImpactCount} key)</span>
          )}
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''} ${
            highImpactCount > 0 ? 'text-red-400' : 'text-yellow-400'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-[#1a1f2e] rounded-xl border border-[#2a3444] shadow-xl z-50 animate-slide-up">
          {/* Header */}
          <div className="sticky top-0 bg-[#1a1f2e] px-4 py-3 border-b border-[#2a3444]">
            <h3 className="font-semibold text-white text-sm">Injury Report</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Affecting today&apos;s {sport} games
            </p>
          </div>

          {/* Teams with injuries */}
          <div className="divide-y divide-[#2a3444]/50">
            {teamsWithInjuries.map((team) => {
              if (team.injuries.length === 0) return null;
              const teamColors = getTeamColors(team.teamName);
              
              // Only show key injuries (Out, Doubtful, Questionable)
              const relevantInjuries = team.injuries.filter(i => 
                ['Out', 'Injured Reserve', 'Doubtful', 'Questionable'].includes(i.status)
              );
              
              if (relevantInjuries.length === 0) return null;

              return (
                <div key={team.teamName} className="p-3">
                  {/* Team Header */}
                  <div className="flex items-center gap-2 mb-2">
                    {teamColors.logo && (
                      <Image
                        src={teamColors.logo}
                        alt={team.teamName}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    )}
                    <span className="font-medium text-white text-sm">{team.teamName}</span>
                  </div>
                  
                  {/* Injuries */}
                  <div className="space-y-1.5 pl-7">
                    {relevantInjuries.slice(0, 5).map((injury) => (
                      <InjuryRow key={injury.id} injury={injury} />
                    ))}
                    {relevantInjuries.length > 5 && (
                      <p className="text-xs text-slate-500">
                        +{relevantInjuries.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-[#242938] px-4 py-2 text-xs text-slate-500 border-t border-[#2a3444]">
            Updated {injuries?.lastUpdated ? new Date(injuries.lastUpdated).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'recently'}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact injury row
function InjuryRow({ injury }: { injury: PlayerInjury }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Out':
      case 'Injured Reserve':
        return 'text-red-400';
      case 'Doubtful':
        return 'text-orange-400';
      case 'Questionable':
        return 'text-yellow-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusAbbrev = (status: string) => {
    switch (status) {
      case 'Injured Reserve': return 'IR';
      case 'Questionable': return 'Q';
      case 'Doubtful': return 'D';
      case 'Out': return 'OUT';
      default: return status;
    }
  };

  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          injury.severity === 'high' ? 'bg-red-500' : 
          injury.severity === 'medium' ? 'bg-yellow-500' : 'bg-slate-500'
        }`} />
        <span className="text-slate-300 truncate">{injury.playerName}</span>
        <span className="text-slate-500">({injury.position})</span>
      </div>
      <span className={`font-medium flex-shrink-0 ml-2 ${getStatusColor(injury.status)}`}>
        {getStatusAbbrev(injury.status)}
      </span>
    </div>
  );
}

// Simple badge for GameCard (just shows count)
export function InjuryBadge({ count, hasKeyPlayers }: { count: number; hasKeyPlayers: boolean }) {
  if (count === 0) return null;
  
  return (
    <span 
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
        hasKeyPlayers 
          ? 'bg-red-500/20 text-red-400' 
          : 'bg-yellow-500/20 text-yellow-400'
      }`}
      title={`${count} injured players`}
    >
      🏥 {count}
    </span>
  );
}
