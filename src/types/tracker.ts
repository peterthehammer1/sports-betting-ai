/**
 * Types for Pick Tracking and Performance Dashboard
 */

export type PickStatus = 'pending' | 'won' | 'lost' | 'push' | 'void';
export type BetType = 'moneyline' | 'spread' | 'total' | 'player_prop';
export type Sport = 'NBA' | 'NHL' | 'NFL';

export interface TrackedPick {
  id: string;
  createdAt: string;
  gameId: string;
  sport: Sport;
  
  // Game info
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  
  // Pick details
  betType: BetType;
  pick: string; // e.g., "Lakers -3.5", "Over 220.5", "LeBron James Over 25.5 points"
  odds: number; // American odds
  line?: number; // Point spread or total line
  
  // AI analysis
  confidence: number; // 0-100
  reasoning: string;
  edge?: number; // Value edge percentage
  isValueBet: boolean;
  
  // Outcome (filled in after game)
  status: PickStatus;
  result?: {
    actualScore?: { home: number; away: number };
    actualValue?: number; // For player props
    settledAt?: string;
  };
  
  // For tracking
  units: number; // Default 1 unit
}

export interface PerformanceStats {
  totalPicks: number;
  pendingPicks: number;
  settledPicks: number;
  
  // Win/Loss
  wins: number;
  losses: number;
  pushes: number;
  winRate: number; // Percentage
  
  // Units/Profit (assuming -110 standard juice unless otherwise specified)
  unitsWagered: number;
  unitsWon: number;
  unitsLost: number;
  netUnits: number;
  roi: number; // Return on Investment percentage
  
  // By bet type
  byBetType: Record<BetType, {
    picks: number;
    wins: number;
    losses: number;
    winRate: number;
    netUnits: number;
  }>;
  
  // By sport
  bySport: Record<Sport, {
    picks: number;
    wins: number;
    losses: number;
    winRate: number;
    netUnits: number;
  }>;
  
  // By confidence level
  byConfidence: {
    high: { picks: number; wins: number; winRate: number }; // 70+
    medium: { picks: number; wins: number; winRate: number }; // 60-69
    low: { picks: number; wins: number; winRate: number }; // <60
  };
  
  // Value bets performance
  valueBets: {
    picks: number;
    wins: number;
    winRate: number;
    netUnits: number;
  };
  
  // Streaks
  currentStreak: { type: 'W' | 'L' | 'none'; count: number };
  longestWinStreak: number;
  longestLossStreak: number;
  
  // Time-based
  last7Days: { picks: number; wins: number; netUnits: number };
  last30Days: { picks: number; wins: number; netUnits: number };
}

export interface OddsMovement {
  gameId: string;
  sport: Sport;
  homeTeam: string;
  awayTeam: string;
  
  // Snapshots over time
  snapshots: Array<{
    timestamp: string;
    moneyline: {
      home: number;
      away: number;
    };
    spread: {
      line: number;
      homePrice: number;
      awayPrice: number;
    };
    total: {
      line: number;
      overPrice: number;
      underPrice: number;
    };
  }>;
  
  // Movement summary
  movement: {
    moneylineHome: number; // Change from opening
    moneylineAway: number;
    spreadLine: number;
    totalLine: number;
  };
  
  openingOdds: {
    timestamp: string;
    moneyline: { home: number; away: number };
    spread: { line: number };
    total: { line: number };
  };
  
  currentOdds: {
    timestamp: string;
    moneyline: { home: number; away: number };
    spread: { line: number };
    total: { line: number };
  };
}

// API response types
export interface TrackerDashboardData {
  stats: PerformanceStats;
  recentPicks: TrackedPick[];
  pendingPicks: TrackedPick[];
}

export interface SavePickRequest {
  gameId: string;
  sport: Sport;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
  betType: BetType;
  pick: string;
  odds: number;
  line?: number;
  confidence: number;
  reasoning: string;
  edge?: number;
  isValueBet: boolean;
}
