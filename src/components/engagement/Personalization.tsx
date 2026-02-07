'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Image from 'next/image';
import { getTeamLogoUrl } from '@/lib/utils/teamLogos';

// Types
interface UserPreferences {
  favoriteTeams: string[];
  favoriteSports: string[];
  notifications: boolean;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
}

const DEFAULT_PREFERENCES: UserPreferences = {
  favoriteTeams: [],
  favoriteSports: [],
  notifications: false,
  riskLevel: 'moderate',
};

// Context for global access
const PersonalizationContext = createContext<{
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
  addFavoriteTeam: (team: string) => void;
  removeFavoriteTeam: (team: string) => void;
  isFavoriteTeam: (team: string) => boolean;
}>({
  preferences: DEFAULT_PREFERENCES,
  setPreferences: () => {},
  addFavoriteTeam: () => {},
  removeFavoriteTeam: () => {},
  isFavoriteTeam: () => false,
});

export function PersonalizationProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('petesbets_preferences');
    if (stored) {
      try {
        setPreferencesState(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse preferences:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  const setPreferences = (prefs: UserPreferences) => {
    setPreferencesState(prefs);
    localStorage.setItem('petesbets_preferences', JSON.stringify(prefs));
  };

  const addFavoriteTeam = (team: string) => {
    if (!preferences.favoriteTeams.includes(team)) {
      setPreferences({
        ...preferences,
        favoriteTeams: [...preferences.favoriteTeams, team],
      });
    }
  };

  const removeFavoriteTeam = (team: string) => {
    setPreferences({
      ...preferences,
      favoriteTeams: preferences.favoriteTeams.filter(t => t !== team),
    });
  };

  const isFavoriteTeam = (team: string) => preferences.favoriteTeams.includes(team);

  if (!isLoaded) return <>{children}</>;

  return (
    <PersonalizationContext.Provider value={{ 
      preferences, 
      setPreferences, 
      addFavoriteTeam, 
      removeFavoriteTeam,
      isFavoriteTeam 
    }}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  return useContext(PersonalizationContext);
}

// Favorite Team Button
export function FavoriteTeamButton({ 
  team, 
  sport,
  size = 'md' 
}: { 
  team: string; 
  sport: 'NHL' | 'NBA' | 'NFL' | 'MLB';
  size?: 'sm' | 'md';
}) {
  const { isFavoriteTeam, addFavoriteTeam, removeFavoriteTeam } = usePersonalization();
  const isFavorite = isFavoriteTeam(team);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      removeFavoriteTeam(team);
    } else {
      addFavoriteTeam(team);
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'w-6 h-6 text-xs' 
    : 'w-8 h-8 text-sm';

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses} rounded-full flex items-center justify-center transition-all ${
        isFavorite 
          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' 
          : 'bg-slate-800 text-slate-500 hover:text-yellow-400 hover:bg-slate-700'
      }`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? '★' : '☆'}
    </button>
  );
}

// "For You" Section
export function ForYouSection({ 
  picks 
}: { 
  picks: Array<{
    id: string;
    homeTeam: string;
    awayTeam: string;
    sport: string;
    pick: string;
    confidence: number;
    odds: number;
  }>
}) {
  const { preferences } = usePersonalization();

  if (preferences.favoriteTeams.length === 0) {
    return <FavoriteTeamsPrompt />;
  }

  // Filter picks that involve user's favorite teams
  const personalizedPicks = picks.filter(pick => 
    preferences.favoriteTeams.some(team => 
      pick.homeTeam.toLowerCase().includes(team.toLowerCase()) ||
      pick.awayTeam.toLowerCase().includes(team.toLowerCase())
    )
  );

  if (personalizedPicks.length === 0) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
        <span className="text-2xl mb-2 block">🎯</span>
        <h3 className="text-lg font-semibold text-white mb-2">No Games Today</h3>
        <p className="text-sm text-slate-400">
          Your favorite teams don&apos;t have games today. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <h2 className="text-lg font-bold text-white">For You</h2>
          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
            {personalizedPicks.length} picks
          </span>
        </div>
      </div>

      <div className="grid gap-3">
        {personalizedPicks.map(pick => (
          <PersonalizedPickCard key={pick.id} pick={pick} />
        ))}
      </div>
    </div>
  );
}

function PersonalizedPickCard({ 
  pick 
}: { 
  pick: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    sport: string;
    pick: string;
    confidence: number;
    odds: number;
  }
}) {
  const { isFavoriteTeam } = usePersonalization();
  const sportType = pick.sport as 'NHL' | 'NBA' | 'NFL' | 'MLB';
  
  const homeIsFavorite = isFavoriteTeam(pick.homeTeam);
  const awayIsFavorite = isFavoriteTeam(pick.awayTeam);
  
  const homeLogo = getTeamLogoUrl(pick.homeTeam, sportType);
  const awayLogo = getTeamLogoUrl(pick.awayTeam, sportType);

  return (
    <div className="bg-slate-800/50 border border-yellow-500/20 rounded-lg p-4 hover:border-yellow-500/40 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase">{pick.sport}</span>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
          {pick.confidence}% confidence
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Away Team */}
          <div className={`flex items-center gap-2 ${awayIsFavorite ? '' : 'opacity-60'}`}>
            {awayLogo ? (
              <div className="w-8 h-8 relative">
                <Image src={awayLogo} alt={pick.awayTeam} fill className="object-contain" unoptimized />
              </div>
            ) : (
              <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                {pick.awayTeam.substring(0, 2)}
              </div>
            )}
            <span className={`font-medium ${awayIsFavorite ? 'text-white' : 'text-slate-400'}`}>
              {pick.awayTeam}
            </span>
            {awayIsFavorite && <span className="text-yellow-400 text-sm">★</span>}
          </div>
          
          <span className="text-slate-500 text-sm">@</span>
          
          {/* Home Team */}
          <div className={`flex items-center gap-2 ${homeIsFavorite ? '' : 'opacity-60'}`}>
            {homeLogo ? (
              <div className="w-8 h-8 relative">
                <Image src={homeLogo} alt={pick.homeTeam} fill className="object-contain" unoptimized />
              </div>
            ) : (
              <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                {pick.homeTeam.substring(0, 2)}
              </div>
            )}
            <span className={`font-medium ${homeIsFavorite ? 'text-white' : 'text-slate-400'}`}>
              {pick.homeTeam}
            </span>
            {homeIsFavorite && <span className="text-yellow-400 text-sm">★</span>}
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm font-bold text-green-400">{pick.pick}</p>
          <p className="text-xs text-slate-500">
            {pick.odds > 0 ? '+' : ''}{pick.odds}
          </p>
        </div>
      </div>
    </div>
  );
}

// Prompt to add favorite teams
function FavoriteTeamsPrompt() {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <div className="bg-gradient-to-r from-yellow-900/20 to-slate-900 border border-yellow-500/20 rounded-lg p-6">
      {!showSelector ? (
        <div className="text-center">
          <span className="text-3xl mb-3 block">⭐</span>
          <h3 className="text-lg font-bold text-white mb-2">Personalize Your Experience</h3>
          <p className="text-sm text-slate-400 mb-4">
            Add your favorite teams to see picks tailored just for you
          </p>
          <button
            onClick={() => setShowSelector(true)}
            className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-medium rounded-lg transition-colors"
          >
            Select Teams →
          </button>
        </div>
      ) : (
        <TeamSelector onClose={() => setShowSelector(false)} />
      )}
    </div>
  );
}

// Team selector component
const TEAMS_BY_SPORT = {
  NFL: ['Chiefs', 'Eagles', '49ers', 'Bills', 'Cowboys', 'Ravens', 'Dolphins', 'Lions', 'Bengals', 'Jets'],
  NBA: ['Lakers', 'Celtics', 'Warriors', 'Nuggets', 'Bucks', 'Suns', '76ers', 'Heat', 'Nets', 'Knicks'],
  NHL: ['Bruins', 'Avalanche', 'Rangers', 'Oilers', 'Hurricanes', 'Stars', 'Devils', 'Kings', 'Lightning', 'Panthers'],
  MLB: ['Dodgers', 'Braves', 'Yankees', 'Astros', 'Rays', 'Phillies', 'Mets', 'Cardinals', 'Mariners', 'Padres'],
};

function TeamSelector({ onClose }: { onClose: () => void }) {
  const { preferences, addFavoriteTeam, removeFavoriteTeam, isFavoriteTeam } = usePersonalization();
  const [selectedSport, setSelectedSport] = useState<keyof typeof TEAMS_BY_SPORT>('NFL');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Select Favorite Teams</h3>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-colors"
        >
          Done
        </button>
      </div>
      
      {/* Sport Tabs */}
      <div className="flex gap-2">
        {(Object.keys(TEAMS_BY_SPORT) as Array<keyof typeof TEAMS_BY_SPORT>).map(sport => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedSport === sport
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>
      
      {/* Teams Grid */}
      <div className="grid grid-cols-2 gap-2">
        {TEAMS_BY_SPORT[selectedSport].map(team => {
          const isFav = isFavoriteTeam(team);
          const logo = getTeamLogoUrl(team, selectedSport);
          
          return (
            <button
              key={team}
              onClick={() => isFav ? removeFavoriteTeam(team) : addFavoriteTeam(team)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isFav
                  ? 'bg-yellow-500/20 border border-yellow-500/30 text-white'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {logo && (
                <div className="w-5 h-5 relative flex-shrink-0">
                  <Image src={logo} alt={team} fill className="object-contain" unoptimized />
                </div>
              )}
              <span className="text-sm font-medium truncate">{team}</span>
              {isFav && <span className="text-yellow-400 ml-auto">★</span>}
            </button>
          );
        })}
      </div>
      
      {/* Current selections */}
      {preferences.favoriteTeams.length > 0 && (
        <div className="pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-500 mb-2">
            {preferences.favoriteTeams.length} team{preferences.favoriteTeams.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex flex-wrap gap-1">
            {preferences.favoriteTeams.map(team => (
              <span key={team} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                {team}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
