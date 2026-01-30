/**
 * Types for injury data across NBA, NHL, and NFL
 */

export type InjuryStatus = 
  | 'Out'
  | 'Doubtful' 
  | 'Questionable'
  | 'Probable'
  | 'Day-To-Day'
  | 'Injured Reserve'
  | 'Suspension'
  | 'Unknown';

export type InjurySeverity = 'high' | 'medium' | 'low';

export interface PlayerInjury {
  id: string;
  playerName: string;
  playerId?: string;
  position: string;
  team: string;
  teamAbbrev: string;
  status: InjuryStatus;
  injuryType: string; // e.g., "Ankle", "Knee", "Illness"
  details?: string; // Additional details
  returnDate?: string; // Expected return date if known
  severity: InjurySeverity;
  lastUpdate: string;
}

export interface TeamInjuries {
  teamName: string;
  teamAbbrev: string;
  teamId?: string;
  injuries: PlayerInjury[];
  keyPlayersOut: number; // Count of starters/key players out
}

export interface GameInjuries {
  gameId: string;
  homeTeam: TeamInjuries;
  awayTeam: TeamInjuries;
  totalInjuries: number;
  impactLevel: 'high' | 'medium' | 'low' | 'none';
  aiInsight?: string; // AI-generated insight about injury impact
}

export interface SportInjuries {
  sport: 'NBA' | 'NHL' | 'NFL';
  lastUpdated: string;
  teams: TeamInjuries[];
  totalInjuries: number;
  fromCache?: boolean; // Added when data comes from cache
}

// ESPN API response types
export interface ESPNInjuryResponse {
  injuries: ESPNTeamInjuries[];
}

export interface ESPNTeamInjuries {
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logo?: string;
  };
  injuries: ESPNPlayerInjury[];
}

export interface ESPNPlayerInjury {
  id: string;
  athlete: {
    id: string;
    displayName: string;
    position: {
      abbreviation: string;
    };
    team?: {
      id: string;
      abbreviation: string;
    };
    headshot?: {
      href: string;
    };
  };
  status: string;
  type: {
    id: string;
    name: string;
    description: string;
    abbreviation: string;
  };
  details?: {
    fantasyStatus?: {
      description: string;
    };
    type?: string;
    location?: string;
    detail?: string;
    side?: string;
    returnDate?: string;
  };
  date: string;
}

// API response type
export interface InjuriesApiResponse {
  sport: string;
  injuries: TeamInjuries[];
  totalInjuries: number;
  lastUpdated: string;
  fromCache: boolean;
}
