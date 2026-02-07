'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getTeamLogoUrl } from '@/lib/utils/teamLogos';

interface TickerGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'live' | 'final' | 'scheduled';
  period?: string;
  startTime?: string;
  sport: string;
}

interface GamesTickerBarProps {
  onGameClick?: (game: TickerGame) => void;
  onSportChange?: (sport: string) => void;
  currentSport?: string;
  externalGames?: TickerGame[]; // Pass games from parent to avoid duplicate fetches
}

const SPORTS = ['NBA', 'NFL', 'EPL']; // NHL temporarily removed during Olympics break

export function GamesTickerBar({ onGameClick, onSportChange, currentSport = 'NBA', externalGames }: GamesTickerBarProps) {
  const [games, setGames] = useState<TickerGame[]>([]);
  const [loading, setLoading] = useState(!externalGames);
  const [activeSport, setActiveSport] = useState(currentSport);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Use external games if provided
  useEffect(() => {
    if (externalGames && externalGames.length > 0) {
      setGames(externalGames);
      setLoading(false);
    }
  }, [externalGames]);

  useEffect(() => {
    // Only fetch if no external games provided
    if (!externalGames || externalGames.length === 0) {
      fetchGames();
      const interval = setInterval(fetchGames, 60000);
      return () => clearInterval(interval);
    }
  }, [activeSport, externalGames]);

  const fetchGames = async () => {
    try {
      // Fetch both odds and scores
      const sportEndpoint = activeSport === 'EPL' ? 'soccer' : activeSport.toLowerCase();
      const [oddsRes, scoresRes] = await Promise.all([
        fetch(`/api/odds/${sportEndpoint}`),
        fetch('/api/scores'),
      ]);

      const oddsData = await oddsRes.json();
      const scoresData = await scoresRes.json();

      // Merge odds with live scores
      const mergedGames: TickerGame[] = (oddsData.games || []).map((game: {
        gameId: string;
        homeTeam: string;
        awayTeam: string;
        commenceTime: string | Date;
      }) => {
        const score = scoresData.scores?.[game.gameId];
        const gameTime = new Date(game.commenceTime);
        const now = new Date();
        const isLive = score?.isLive || (gameTime <= now && !score?.isCompleted);
        const isFinal = score?.isCompleted;

        return {
          id: game.gameId,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          homeScore: score?.homeScore ?? null,
          awayScore: score?.awayScore ?? null,
          status: isFinal ? 'final' : isLive ? 'live' : 'scheduled',
          period: score?.period,
          startTime: game.commenceTime?.toString(),
          sport: activeSport,
        };
      });

      setGames(mergedGames);
    } catch (error) {
      console.error('Failed to fetch ticker games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSportClick = (sport: string) => {
    setActiveSport(sport);
    onSportChange?.(sport);
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-[#0a0e14] border-b border-slate-800">
      {/* Sport Pills */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-slate-800/50 overflow-x-auto scrollbar-hide">
        {SPORTS.map((sport) => (
          <button
            key={sport}
            onClick={() => handleSportClick(sport)}
            className={`px-3 py-1 text-[11px] font-semibold rounded transition-all whitespace-nowrap ${
              activeSport === sport
                ? 'bg-white text-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {sport === 'EPL' ? 'Soccer' : sport}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-[10px] text-slate-600 px-2">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Games Ticker */}
      <div className="relative flex items-center">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 h-full px-1.5 bg-gradient-to-r from-[#0a0e14] via-[#0a0e14] to-transparent hover:from-slate-800 transition-colors"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Scrollable Games */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide py-2 px-8 gap-0.5"
        >
          {loading ? (
            <div className="flex items-center justify-center w-full py-3">
              <div className="w-4 h-4 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
            </div>
          ) : games.length === 0 ? (
            <div className="text-slate-500 text-xs py-3 px-4">No games today</div>
          ) : (
            games.map((game, idx) => (
              <GameTicket
                key={game.id}
                game={game}
                onClick={() => onGameClick?.(game)}
                isLast={idx === games.length - 1}
              />
            ))
          )}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 h-full px-1.5 bg-gradient-to-l from-[#0a0e14] via-[#0a0e14] to-transparent hover:from-slate-800 transition-colors"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function GameTicket({ 
  game, 
  onClick, 
  isLast 
}: { 
  game: TickerGame; 
  onClick: () => void;
  isLast: boolean;
}) {
  const getSportForLogo = (sport: string): 'NBA' | 'NHL' | 'NFL' | 'MLB' | 'EPL' => {
    const sportMap: Record<string, 'NBA' | 'NHL' | 'NFL' | 'MLB' | 'EPL'> = {
      NBA: 'NBA',
      NHL: 'NHL',
      NFL: 'NFL',
      MLB: 'MLB',
      EPL: 'EPL',
    };
    return sportMap[sport] || 'NBA';
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const isWinning = (teamScore: number | null, opponentScore: number | null) => {
    if (teamScore === null || opponentScore === null) return false;
    return teamScore > opponentScore;
  };

  return (
    <button
      onClick={onClick}
      title="Click for AI Analysis"
      className={`flex-shrink-0 w-[140px] bg-[#161b22] hover:bg-[#1c2128] border-r border-slate-800 transition-all hover:scale-[1.02] group ${
        isLast ? 'border-r-0' : ''
      }`}
    >
      <div className="px-2.5 py-2 relative">
        {/* Hover indicator */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* Status */}
        <div className="flex items-center justify-between mb-1.5">
          {game.status === 'live' ? (
            <span className="flex items-center gap-1 text-[9px] font-bold text-red-500 uppercase">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              {game.period || 'LIVE'}
            </span>
          ) : game.status === 'final' ? (
            <span className="text-[9px] font-semibold text-slate-500 uppercase">Final</span>
          ) : (
            <span className="text-[9px] text-slate-500">{formatTime(game.startTime)}</span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between gap-1.5 mb-1">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className="w-4 h-4 flex-shrink-0 relative">
              <Image
                src={getTeamLogoUrl(game.awayTeam, getSportForLogo(game.sport)) || '/placeholder-team.png'}
                alt={game.awayTeam}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className={`text-[11px] truncate ${
              game.status !== 'scheduled' && isWinning(game.awayScore, game.homeScore)
                ? 'text-white font-semibold'
                : 'text-slate-400'
            }`}>
              {game.awayTeam.split(' ').pop()}
            </span>
          </div>
          {game.status !== 'scheduled' && (
            <span className={`text-[11px] font-mono font-semibold tabular-nums ${
              isWinning(game.awayScore, game.homeScore) ? 'text-white' : 'text-slate-500'
            }`}>
              {game.awayScore ?? '-'}
            </span>
          )}
        </div>

        {/* Home Team */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <div className="w-4 h-4 flex-shrink-0 relative">
              <Image
                src={getTeamLogoUrl(game.homeTeam, getSportForLogo(game.sport)) || '/placeholder-team.png'}
                alt={game.homeTeam}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className={`text-[11px] truncate ${
              game.status !== 'scheduled' && isWinning(game.homeScore, game.awayScore)
                ? 'text-white font-semibold'
                : 'text-slate-400'
            }`}>
              {game.homeTeam.split(' ').pop()}
            </span>
          </div>
          {game.status !== 'scheduled' && (
            <span className={`text-[11px] font-mono font-semibold tabular-nums ${
              isWinning(game.homeScore, game.awayScore) ? 'text-white' : 'text-slate-500'
            }`}>
              {game.homeScore ?? '-'}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
