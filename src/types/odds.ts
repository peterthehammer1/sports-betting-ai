// Types matching The Odds API response structure exactly

export interface OddsOutcome {
  name: string;
  price: number; // Decimal odds (e.g., 1.66, 2.23)
  point?: number; // For spreads/totals (e.g., -1.5, 6.5)
}

export interface Market {
  key: MarketType;
  last_update: string; // ISO datetime
  outcomes: OddsOutcome[];
}

export interface Bookmaker {
  key: string; // e.g., "fanduel", "draftkings"
  title: string; // e.g., "FanDuel", "DraftKings"
  last_update: string; // ISO datetime
  markets: Market[];
}

export interface GameOdds {
  id: string;
  sport_key: SportKey;
  sport_title: string;
  commence_time: string; // ISO datetime
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

// Supported sports
export type SportKey = 'icehockey_nhl' | 'basketball_nba';

// Market types
export type MarketType = 
  | 'h2h'           // Moneyline (head-to-head)
  | 'spreads'       // Puck line (NHL) / Point spread (NBA)
  | 'totals'        // Over/Under
  | 'player_points' // Player props - points
  | 'player_assists'
  | 'player_rebounds'
  | 'player_threes'
  | 'player_blocks_steals'
  | 'player_goal_scorer_first'    // NHL First Goal Scorer
  | 'player_goal_scorer_anytime'  // NHL Anytime Goal Scorer
  | 'player_goal_scorer_last';    // NHL Last Goal Scorer

// Bookmaker keys we care about
export type BookmakerKey = 
  | 'fanduel'
  | 'draftkings'
  | 'betmgm'
  | 'betrivers'
  | 'bovada'
  | 'betonlineag'
  | 'mybookieag'
  | 'lowvig'
  | 'betus';

// Processed/normalized types for our app
export interface NormalizedOdds {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: Date;
  moneyline: {
    home: BookOdds[];
    away: BookOdds[];
    bestHome: BookOdds | null;
    bestAway: BookOdds | null;
  };
  spread: {
    home: SpreadOdds[];
    away: SpreadOdds[];
    consensusLine: number | null;
  };
  total: {
    over: TotalOdds[];
    under: TotalOdds[];
    consensusLine: number | null;
  };
}

export interface BookOdds {
  bookmaker: string;
  bookmakerTitle: string;
  price: number; // Decimal
  americanOdds: number; // Converted to American
  impliedProbability: number; // As decimal (0-1)
  lastUpdate: Date;
}

export interface SpreadOdds extends BookOdds {
  point: number; // The spread (e.g., -1.5)
}

export interface TotalOdds extends BookOdds {
  point: number; // The total line (e.g., 6.5)
}

// API response wrapper
export interface OddsApiResponse {
  games: GameOdds[];
  requestsRemaining: number;
  requestsUsed: number;
}

// Sports list response
export interface Sport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

// Player props types
export interface PlayerPropOutcome {
  name: string; // Player name or description
  description?: string; // Additional info (e.g., "First Goal Scorer")
  price: number; // Decimal odds
  point?: number; // For over/under props
}

export interface PlayerPropMarket {
  key: 'player_goal_scorer_first' | 'player_goal_scorer_anytime' | 'player_goal_scorer_last';
  last_update: string;
  outcomes: PlayerPropOutcome[];
}

export interface PlayerPropsResponse {
  id: string;
  sport_key: SportKey;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    last_update: string;
    markets: PlayerPropMarket[];
  }>;
}

// Normalized player prop for display
export interface NormalizedPlayerProp {
  playerName: string;
  team: string;
  market: 'first_goal_scorer' | 'anytime_goal_scorer';
  odds: Array<{
    bookmaker: string;
    bookmakerTitle: string;
    price: number;
    americanOdds: number;
    impliedProbability: number;
  }>;
  bestOdds: {
    bookmaker: string;
    bookmakerTitle: string;
    price: number;
    americanOdds: number;
    impliedProbability: number;
  } | null;
  averageImpliedProb: number;
}

// Game with player props
export interface GameWithPlayerProps {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: Date;
  firstGoalScorers: NormalizedPlayerProp[];
  anytimeGoalScorers: NormalizedPlayerProp[];
}
